import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const GENERIC_INTERNAL_ERROR_MESSAGE = 'Erro interno no servidor';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = GENERIC_INTERNAL_ERROR_MESSAGE;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Conflito: já existe um registro com os dados informados.';
      } else if (exception.code === 'P2003') {
        status = HttpStatus.CONFLICT;
        message = 'Operação bloqueada por vínculo com registros relacionados.';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Registro solicitado não encontrado.';
      }
    } else if (
      exception instanceof Prisma.PrismaClientValidationError ||
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientRustPanicError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError
    ) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = GENERIC_INTERNAL_ERROR_MESSAGE;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        message = GENERIC_INTERNAL_ERROR_MESSAGE;
      } else {
        const exceptionResponse = exception.getResponse();
        if (
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null &&
          'message' in exceptionResponse
        ) {
          message = (exceptionResponse as { message: string | string[] }).message;
        } else if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
        } else {
          message = exception.message;
        }
      }
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const prismaCode =
        exception instanceof Prisma.PrismaClientKnownRequestError
          ? ` [Prisma:${exception.code}]`
          : '';
      this.logger.error(
        `${request.method} ${request.url} -> ${status}${prismaCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
