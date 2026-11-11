import type { Project } from './project.types';

export interface Client {
  id: string;
  name: string;
  whatsapp?: string | null;
  whatsappClean?: string | null;
  email?: string | null;
  notes?: string | null;
  projectsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithHistory extends Omit<Client, 'projectsCount'> {
  projects: Project[];
  summary: {
    totalProjects: number;
    totalCharged: number;
    totalPaid: number;
    totalReceivable: number;
  };
}

export interface CreateClientInput {
  name: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
}

export type UpdateClientInput = Partial<CreateClientInput>;

