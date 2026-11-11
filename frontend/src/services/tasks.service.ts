import { api } from './api';
import type {
  ChecklistResponse,
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../types/task.types';

export const tasksService = {
  async listByProject(projectId: string) {
    const { data } = await api.get<ChecklistResponse>(
      `/projects/${projectId}/tasks`,
    );
    return data;
  },

  async create(projectId: string, payload: CreateTaskInput) {
    const { data } = await api.post<{
      task: Task;
      completedCount: number;
      totalCount: number;
      progressPercentage: number;
    }>(`/projects/${projectId}/tasks`, payload);
    return data;
  },

  async update(taskId: string, payload: UpdateTaskInput) {
    const { data } = await api.patch<{
      task: Task;
      completedCount: number;
      totalCount: number;
      progressPercentage: number;
    }>(`/tasks/${taskId}`, payload);
    return data;
  },

  async remove(taskId: string) {
    const { data } = await api.delete<{
      deleted: boolean;
      id: string;
      completedCount: number;
      totalCount: number;
      progressPercentage: number;
    }>(`/tasks/${taskId}`);
    return data;
  },
};

