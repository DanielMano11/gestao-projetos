import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import type {
  CreatePaymentInput,
  CreateProjectInput,
  ProjectFilterParams,
  ProjectStatus,
  UpdateFinancialsInput,
  UpdateProjectInput,
} from '../types/project.types';

export function useProjects(params?: ProjectFilterParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsService.list(params),
  });
}

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectInput) => projectsService.create(payload),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['clients', created.clientId] });
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectInput }) =>
      projectsService.update(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['projects', updated.id] });
      void queryClient.invalidateQueries({ queryKey: ['clients', updated.clientId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      projectsService.updateStatus(id, status),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['projects', updated.id] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', updated.id] });
      void queryClient.invalidateQueries({ queryKey: ['clients', updated.clientId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useUpdateProjectFinancials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFinancialsInput }) =>
      projectsService.updateFinancials(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['projects', updated.id] });
      void queryClient.invalidateQueries({ queryKey: ['clients', updated.clientId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useAddProjectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreatePaymentInput;
    }) => projectsService.addPayment(projectId, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['projects', updated.id] });
      void queryClient.invalidateQueries({ queryKey: ['clients', updated.clientId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useRemoveProjectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => projectsService.removePayment(paymentId),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['projects', updated.id] });
      void queryClient.invalidateQueries({ queryKey: ['clients', updated.clientId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

