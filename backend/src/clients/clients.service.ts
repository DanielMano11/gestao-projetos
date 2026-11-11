import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

export function sanitizeWhatsapp(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { whatsapp: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { projects: true } },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: items.map((client) => ({
        id: client.id,
        name: client.name,
        whatsapp: client.whatsapp,
        whatsappClean: sanitizeWhatsapp(client.whatsapp),
        email: client.email,
        notes: client.notes,
        projectsCount: client._count.projects,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(userId: string, dto: CreateClientDto) {
    const whatsappClean = sanitizeWhatsapp(dto.whatsapp);
    const client = await this.prisma.client.create({
      data: {
        userId,
        name: dto.name.trim(),
        whatsapp: dto.whatsapp?.trim() || null,
        email: dto.email?.toLowerCase().trim() || null,
        notes: dto.notes?.trim() || null,
      },
    });

    return {
      ...client,
      whatsappClean,
      projectsCount: 0,
    };
  }

  async findOneWithHistory(userId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
      include: {
        projects: {
          orderBy: { deadline: 'asc' },
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado na sua carteira');
    }

    const projects = client.projects.map((p) => {
      const charged = Number(p.chargedAmount);
      const paid = Number(p.paidAmount);
      const receivable = p.status === 'CANCELED' ? 0 : Math.max(0, Number((charged - paid).toFixed(2)));
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.isCompleted).length;
      const progressPercentage =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        deadline: p.deadline,
        chargedAmount: charged,
        paidAmount: paid,
        receivableAmount: receivable,
        progressPercentage,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    const totalCharged = projects
      .filter((p) => p.status !== 'CANCELED' && p.status !== 'PROPOSAL')
      .reduce((acc, p) => acc + p.chargedAmount, 0);
    const totalPaid = projects.reduce((acc, p) => acc + p.paidAmount, 0);
    const totalReceivable = projects.reduce((acc, p) => acc + p.receivableAmount, 0);

    return {
      id: client.id,
      name: client.name,
      whatsapp: client.whatsapp,
      whatsappClean: sanitizeWhatsapp(client.whatsapp),
      email: client.email,
      notes: client.notes,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      projects,
      summary: {
        totalProjects: projects.length,
        totalCharged: Number(totalCharged.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalReceivable: Number(totalReceivable.toFixed(2)),
      },
    };
  }

  async update(userId: string, id: string, dto: UpdateClientDto) {
    const existing = await this.prisma.client.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Cliente não encontrado na sua carteira');
    }

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.whatsapp !== undefined ? { whatsapp: dto.whatsapp?.trim() || null } : {}),
        ...(dto.email !== undefined ? { email: dto.email?.toLowerCase().trim() || null } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
      },
      include: {
        _count: { select: { projects: true } },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      whatsapp: updated.whatsapp,
      whatsappClean: sanitizeWhatsapp(updated.whatsapp),
      email: updated.email,
      notes: updated.notes,
      projectsCount: updated._count.projects,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.client.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { projects: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Cliente não encontrado na sua carteira');
    }

    if (existing._count.projects > 0) {
      throw new ConflictException(
        'Não é possível excluir um cliente que já possui projetos vinculados no histórico de serviços.',
      );
    }

    await this.prisma.client.delete({ where: { id } });
    return { deleted: true, id };
  }
}

