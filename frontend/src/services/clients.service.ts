import { api } from './api';
import type {
  Client,
  ClientWithHistory,
  CreateClientInput,
  UpdateClientInput,
} from '../types/client.types';

export interface PaginatedClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const clientsService = {
  async list(params?: { search?: string; page?: number; limit?: number }) {
    const { data } = await api.get<PaginatedClientsResponse>('/clients', {
      params,
    });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<ClientWithHistory>(`/clients/${id}`);
    return data;
  },

  async create(payload: CreateClientInput) {
    const { data } = await api.post<Client>('/clients', payload);
    return data;
  },

  async update(id: string, payload: UpdateClientInput) {
    const { data } = await api.patch<Client>(`/clients/${id}`, payload);
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete<{ deleted: boolean; id: string }>(
      `/clients/${id}`,
    );
    return data;
  },
};

