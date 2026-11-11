import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../services/clients.service';
import type { CreateClientInput, UpdateClientInput } from '../types/client.types';

export function useClients(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientsService.list(params),
  });
}

export function useClientDetail(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientInput) => clientsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientInput }) =>
      clientsService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      void queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

