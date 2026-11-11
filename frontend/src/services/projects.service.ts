import { api } from './api';
import type {
  CreatePaymentInput,
  CreateProjectInput,
  Project,
  ProjectFilterParams,
  ProjectStatus,
  UpdateFinancialsInput,
  UpdateProjectInput,
} from '../types/project.types';

export interface PaginatedProjectsResponse {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const projectsService = {
  async list(params?: ProjectFilterParams) {
    const cleanedParams = { ...params };
    if (!cleanedParams.status) delete cleanedParams.status;
    if (!cleanedParams.clientId) delete cleanedParams.clientId;
    if (!cleanedParams.search) delete cleanedParams.search;

    const { data } = await api.get<PaginatedProjectsResponse>('/projects', {
      params: cleanedParams,
    });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(payload: CreateProjectInput) {
    const { data } = await api.post<Project>('/projects', payload);
    return data;
  },

  async update(id: string, payload: UpdateProjectInput) {
    const { data } = await api.patch<Project>(`/projects/${id}`, payload);
    return data;
  },

  async updateStatus(id: string, status: ProjectStatus) {
    const { data } = await api.patch<Project>(`/projects/${id}/status`, {
      status,
    });
    return data;
  },

  async updateFinancials(id: string, payload: UpdateFinancialsInput) {
    const { data } = await api.patch<Project>(
      `/projects/${id}/financials`,
      payload,
    );
    return data;
  },

  async addPayment(projectId: string, payload: CreatePaymentInput) {
    const { data } = await api.post<Project>(
      `/projects/${projectId}/payments`,
      payload,
    );
    return data;
  },

  async removePayment(paymentId: string) {
    const { data } = await api.delete<Project>(`/payments/${paymentId}`);
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete<{ deleted: boolean; id: string }>(
      `/projects/${id}`,
    );
    return data;
  },
};

