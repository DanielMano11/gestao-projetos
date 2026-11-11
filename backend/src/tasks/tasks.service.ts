import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export function calculateChecklistProgress(
  tasks: { isCompleted: boolean }[],
): { completedCount: number; totalCount: number; progressPercentage: number } {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, progressPercentage };
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureProjectBelongsToUser(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        client: { userId },
      },
    });
    if (!project) {
      throw new NotFoundException('Projeto não encontrado na sua carteira');
    }
    return project;
  }

  async findByProject(userId: string, projectId: string) {
    await this.ensureProjectBelongsToUser(userId, projectId);
    const items = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
    const summary = calculateChecklistProgress(items);
    return {
      items,
      ...summary,
    };
  }

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    await this.ensureProjectBelongsToUser(userId, projectId);
    const existingCount = await this.prisma.task.count({ where: { projectId } });

    const created = await this.prisma.task.create({
      data: {
        projectId,
        title: dto.title.trim(),
        position: dto.position ?? existingCount,
        isCompleted: false,
      },
    });

    const items = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      task: created,
      ...calculateChecklistProgress(items),
    };
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: { client: { userId } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada na sua carteira');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.isCompleted !== undefined ? { isCompleted: dto.isCompleted } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
      },
    });

    const items = await this.prisma.task.findMany({
      where: { projectId: existing.projectId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      task: updated,
      ...calculateChecklistProgress(items),
    };
  }

  async remove(userId: string, taskId: string) {
    const existing = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: { client: { userId } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada na sua carteira');
    }

    await this.prisma.task.delete({ where: { id: taskId } });

    const items = await this.prisma.task.findMany({
      where: { projectId: existing.projectId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      deleted: true,
      id: taskId,
      ...calculateChecklistProgress(items),
    };
  }
}

