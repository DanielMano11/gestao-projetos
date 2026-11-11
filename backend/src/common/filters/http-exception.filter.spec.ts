import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let hostMock: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    hostMock = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
        getRequest: () => ({ method: 'POST', url: '/api/v1/clients' }),
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve converter PrismaClientKnownRequestError P2002 em 409 Conflict sem vazar metadados', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the constraint: `users_email_key`',
      {
        code: 'P2002',
        clientVersion: '5.22.0',
        meta: { target: ['email'] },
      },
    );

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const body = jsonMock.mock.calls[0][0];
    expect(body.statusCode).toBe(409);
    expect(body.message).toBe(
      'Conflito: já existe um registro com os dados informados.',
    );
    expect(JSON.stringify(body)).not.toContain('users_email_key');
    expect(JSON.stringify(body)).not.toContain('Unique constraint');
  });

  it('deve converter Prisma P2003 em 409 e P2025 em 404 sem expor detalhes internos', () => {
    const fkError = new Prisma.PrismaClientKnownRequestError('FK violation', {
      code: 'P2003',
      clientVersion: '5.22.0',
    });
    filter.catch(fkError, hostMock);
    expect(statusMock).toHaveBeenLastCalledWith(HttpStatus.CONFLICT);

    const notFoundError = new Prisma.PrismaClientKnownRequestError(
      'Record to update not found',
      {
        code: 'P2025',
        clientVersion: '5.22.0',
      },
    );
    filter.catch(notFoundError, hostMock);
    expect(statusMock).toHaveBeenLastCalledWith(HttpStatus.NOT_FOUND);
  });

  it('deve mascarar erros Prisma desconhecidos, PrismaClientValidationError e erros genéricos 500', () => {
    const unknownPrismaError = new Prisma.PrismaClientKnownRequestError(
      'Table `public.clients` does not exist',
      {
        code: 'P2021',
        clientVersion: '5.22.0',
      },
    );
    filter.catch(unknownPrismaError, hostMock);
    expect(statusMock).toHaveBeenLastCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(jsonMock.mock.calls[0][0].message).toBe('Erro interno no servidor');

    const validationError = new Prisma.PrismaClientValidationError(
      'Invalid argument in prisma.client.create()',
      { clientVersion: '5.22.0' },
    );
    filter.catch(validationError, hostMock);
    expect(statusMock).toHaveBeenLastCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(jsonMock.mock.calls[1][0].message).toBe('Erro interno no servidor');

    const rawError = new Error(
      'ECONNREFUSED postgres://admin:secret@10.0.0.8:5432/prod',
    );
    filter.catch(rawError, hostMock);
    expect(statusMock).toHaveBeenLastCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    const body = jsonMock.mock.calls[2][0];
    expect(body.message).toBe('Erro interno no servidor');
    expect(JSON.stringify(body)).not.toContain('postgres');
    expect(JSON.stringify(body)).not.toContain('secret');

    filter.catch(
      new InternalServerErrorException('Stack interno confidencial'),
      hostMock,
    );
    expect(statusMock).toHaveBeenLastCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(jsonMock.mock.calls[3][0].message).toBe('Erro interno no servidor');
  });

  it('deve preservar mensagens funcionais de erros 4xx (ValidationPipe e 429 Throttler)', () => {
    filter.catch(
      new BadRequestException(['O campo name não deve estar vazio']),
      hostMock,
    );
    expect(statusMock).toHaveBeenLastCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock.mock.calls[0][0].message).toEqual([
      'O campo name não deve estar vazio',
    ]);

    filter.catch(
      new HttpException(
        'ThrottlerException: Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      ),
      hostMock,
    );
    expect(statusMock).toHaveBeenLastCalledWith(HttpStatus.TOO_MANY_REQUESTS);
    expect(jsonMock.mock.calls[1][0].message).toBe(
      'ThrottlerException: Too Many Requests',
    );
  });
});

