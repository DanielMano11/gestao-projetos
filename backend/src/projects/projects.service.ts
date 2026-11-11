import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import {
  CreatePaymentDto,
  UpdateProjectFinancialsDto,
} from './dto/update-project-financials.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';

export type FinancialStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export interface ComputedProjectMetrics {
  chargedAmount: number;
  paidAmount: number;
  receivableAmount: number;
  financialStatus: FinancialStatus;
  progressPercentage: number;
  completedTasksCount: number;
  totalTasksCount: number;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean;
}

export function computeProjectMetrics(
  project: {
    status: ProjectStatus;
    deadline: Date;
    chargedAmount: Prisma.Decimal | number;
    paidAmount: Prisma.Decimal | number;
    tasks?: { isCompleted: boolean }[];
  },
  referenceDate: Date = new Date(),
): ComputedProjectMetrics {
  const chargedAmount = Number(Number(project.chargedAmount).toFixed(2));
  const paidAmount = Number(Number(project.paidAmount).toFixed(2));
  const receivableAmount =
    project.status === ProjectStatus.CANCELED
      ? 0
      : Math.max(0, Number((chargedAmount - paidAmount).toFixed(2)));

  let financialStatus: FinancialStatus = 'PENDING';
  if (chargedAmount > 0 && paidAmount >= chargedAmount) {
    financialStatus = 'PAID';
  } else if (paidAmount > 0 && paidAmount < chargedAmount) {
    financialStatus = 'PARTIAL';
  }

  const tasks = project.tasks ?? [];
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercentage =
    totalTasksCount === 0
      ? 0
      : Math.round((completedTasksCount / totalTasksCount) * 100);

  const todayUtc = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  );
  const deadlineDate = new Date(project.deadline);
  const deadlineUtc = Date.UTC(
    deadlineDate.getUTCFullYear(),
    deadlineDate.getUTCMonth(),
    deadlineDate.getUTCDate(),
  );
  const daysRemaining = Math.floor(
    (deadlineUtc - todayUtc) / (1000 * 60 * 60 * 24),
  );

  const isActiveStatus =
    project.status === ProjectStatus.IN_PROGRESS ||
    project.status === ProjectStatus.PAUSED;

  const isOverdue = isActiveStatus && daysRemaining < 0;
  const isUrgent = isActiveStatus && daysRemaining <= 7;

  return {
    chargedAmount,
    paidAmount,
    receivableAmount,
    financialStatus,
    progressPercentage,
    completedTasksCount,
    totalTasksCount,
    daysRemaining,
    isOverdue,
    isUrgent,
  };
}

export function validateFinancialAmounts(chargedAmount: number, paidAmount: number): void {
  if (chargedAmount < 0 || paidAmount < 0) {
    throw new BadRequestException('Valores financeiros não podem ser negativos.');
  }
  if (Number(paidAmount.toFixed(2)) > Number(chargedAmount.toFixed(2))) {
    throw new BadRequestException(
      'O valor pago não pode ser superior ao valor cobrado do projeto.',
    );
  }
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureClientBelongsToUser(userId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, userId },
    });
    if (!client) {
      throw new NotFoundException('Cliente vinculado não encontrado na sua carteira');
    }
    return client;
  }

  private async getProjectOwnedByUser(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        client: { userId },
      },
      include: {
        client: { select: { id: true, name: true, whatsapp: true, email: true } },
        tasks: { orderBy: { position: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado na sua carteira');
    }

    return project;
  }

  private formatProjectResponse(project: {
    id: string;
    clientId: string;
    title: string;
    description: string | null;
    status: ProjectStatus;
    deadline: Date;
    chargedAmount: Prisma.Decimal | number;
    paidAmount: Prisma.Decimal | number;
    createdAt: Date;
    updatedAt: Date;
    client?: { id: string; name: string; whatsapp?: string | null; email?: string | null };
    tasks?: { id: string; title: string; isCompleted: boolean; position: number; createdAt: Date; updatedAt: Date }[];
    payments?: { id: string; amount: Prisma.Decimal | number; paidAt: Date; note: string | null; createdAt: Date }[];
  }) {
    const metrics = computeProjectMetrics(project);
    return {
      id: project.id,
      clientId: project.clientId,
      title: project.title,
      description: project.description,
      status: project.status,
      deadline: project.deadline,
      ...metrics,
      client: project.client,
      tasks: project.tasks ?? [],
      payments: (project.payments ?? []).map((pay) => ({
        id: pay.id,
        amount: Number(pay.amount),
        paidAt: pay.paidAt,
        note: pay.note,
        createdAt: pay.createdAt,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async findAll(userId: string, filter: ProjectFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const where: Prisma.ProjectWhereInput = {
      client: { userId },
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.clientId ? { clientId: filter.clientId } : {}),
      ...(filter.search
        ? {
            OR: [
              { title: { contains: filter.search, mode: 'insensitive' } },
              { description: { contains: filter.search, mode: 'insensitive' } },
              { client: { name: { contains: filter.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const allMatching = await this.prisma.project.findMany({
      where,
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
      include: {
        client: { select: { id: true, name: true, whatsapp: true, email: true } },
        tasks: { orderBy: { position: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    const formatted = allMatching
      .map((p) => this.formatProjectResponse(p))
      .filter((p) => {
        if (filter.overdueOnly && !p.isOverdue) return false;
        if (filter.urgentOnly && !p.isUrgent) return false;
        return true;
      });

    const total = formatted.length;
    const start = (page - 1) * limit;
    const paginated = formatted.slice(start, start + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(userId: string, dto: CreateProjectDto) {
    await this.ensureClientBelongsToUser(userId, dto.clientId);

    const chargedAmount = dto.chargedAmount;
    const paidAmount = dto.paidAmount ?? 0;
    validateFinancialAmounts(chargedAmount, paidAmount);

    const status = dto.status ?? ProjectStatus.PROPOSAL;
    const initialTasks = (dto.initialTasks ?? [])
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const created = await this.prisma.$transaction(async (tx) => {
      return tx.project.create({
        data: {
          clientId: dto.clientId,
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          status,
          deadline: new Date(dto.deadline),
          chargedAmount,
          paidAmount,
          tasks:
            initialTasks.length > 0
              ? {
                  create: initialTasks.map((title, index) => ({
                    title,
                    isCompleted: status === ProjectStatus.COMPLETED,
                    position: index,
                  })),
                }
              : undefined,
        },
        include: {
          client: { select: { id: true, name: true, whatsapp: true, email: true } },
          tasks: { orderBy: { position: 'asc' } },
          payments: { orderBy: { paidAt: 'desc' } },
        },
      });
    });

    return this.formatProjectResponse(created);
  }

  async findOne(userId: string, id: string) {
    const project = await this.getProjectOwnedByUser(userId, id);
    return this.formatProjectResponse(project);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const existing = await this.getProjectOwnedByUser(userId, id);

    if (dto.clientId && dto.clientId !== existing.clientId) {
      await this.ensureClientBelongsToUser(userId, dto.clientId);
    }

    const nextCharged =
      dto.chargedAmount !== undefined
        ? dto.chargedAmount
        : Number(existing.chargedAmount);
    const nextPaid =
      dto.paidAmount !== undefined ? dto.paidAmount : Number(existing.paidAmount);

    validateFinancialAmounts(nextCharged, nextPaid);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.status === ProjectStatus.COMPLETED) {
        await tx.task.updateMany({
          where: { projectId: id },
          data: { isCompleted: true },
        });
      }

      return tx.project.update({
        where: { id },
        data: {
          ...(dto.clientId !== undefined ? { clientId: dto.clientId } : {}),
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description?.trim() || null }
            : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.deadline !== undefined
            ? { deadline: new Date(dto.deadline) }
            : {}),
          ...(dto.chargedAmount !== undefined
            ? { chargedAmount: dto.chargedAmount }
            : {}),
          ...(dto.paidAmount !== undefined ? { paidAmount: dto.paidAmount } : {}),
        },
        include: {
          client: { select: { id: true, name: true, whatsapp: true, email: true } },
          tasks: { orderBy: { position: 'asc' } },
          payments: { orderBy: { paidAt: 'desc' } },
        },
      });
    });

    return this.formatProjectResponse(updated);
  }

  async updateStatus(userId: string, id: string, dto: UpdateProjectStatusDto) {
    await this.getProjectOwnedByUser(userId, id);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.status === ProjectStatus.COMPLETED) {
        await tx.task.updateMany({
          where: { projectId: id },
          data: { isCompleted: true },
        });
      }

      return tx.project.update({
        where: { id },
        data: { status: dto.status },
        include: {
          client: { select: { id: true, name: true, whatsapp: true, email: true } },
          tasks: { orderBy: { position: 'asc' } },
          payments: { orderBy: { paidAt: 'desc' } },
        },
      });
    });

    return this.formatProjectResponse(updated);
  }

  async updateFinancials(
    userId: string,
    id: string,
    dto: UpdateProjectFinancialsDto,
  ) {
    await this.getProjectOwnedByUser(userId, id);
    validateFinancialAmounts(dto.chargedAmount, dto.paidAmount);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        chargedAmount: dto.chargedAmount,
        paidAmount: dto.paidAmount,
      },
      include: {
        client: { select: { id: true, name: true, whatsapp: true, email: true } },
        tasks: { orderBy: { position: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    return this.formatProjectResponse(updated);
  }

  async addPayment(userId: string, projectId: string, dto: CreatePaymentDto) {
    const existing = await this.getProjectOwnedByUser(userId, projectId);
    const chargedAmount = Number(existing.chargedAmount);
    const currentPaid = Number(existing.paidAmount);
    const nextPaid = Number((currentPaid + dto.amount).toFixed(2));

    validateFinancialAmounts(chargedAmount, nextPaid);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          projectId,
          amount: dto.amount,
          paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
          note: dto.note?.trim() || null,
        },
      });

      return tx.project.update({
        where: { id: projectId },
        data: { paidAmount: nextPaid },
        include: {
          client: { select: { id: true, name: true, whatsapp: true, email: true } },
          tasks: { orderBy: { position: 'asc' } },
          payments: { orderBy: { paidAt: 'desc' } },
        },
      });
    });

    return this.formatProjectResponse(updated);
  }

  async removePayment(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        project: { client: { userId } },
      },
      include: { project: true },
    });

    if (!payment) {
      throw new NotFoundException('Lançamento de pagamento não encontrado');
    }

    const currentPaid = Number(payment.project.paidAmount);
    const nextPaid = Math.max(
      0,
      Number((currentPaid - Number(payment.amount)).toFixed(2)),
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id: paymentId } });

      return tx.project.update({
        where: { id: payment.projectId },
        data: { paidAmount: nextPaid },
        include: {
          client: { select: { id: true, name: true, whatsapp: true, email: true } },
          tasks: { orderBy: { position: 'asc' } },
          payments: { orderBy: { paidAt: 'desc' } },
        },
      });
    });

    return this.formatProjectResponse(updated);
  }

  async remove(userId: string, id: string) {
    await this.getProjectOwnedByUser(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true, id };
  }
}

