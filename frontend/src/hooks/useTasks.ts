import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../services/tasks.service';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.types';

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksService.listByProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskInput) =>
      tasksService.create(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskInput;
    }) => tasksService.update(taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksService.remove(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

