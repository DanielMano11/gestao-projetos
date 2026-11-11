import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  useCreateProject,
  useProjects,
  useUpdateProjectStatus,
} from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { ProjectFiltersBar } from '../features/projects/ProjectFiltersBar';
import { ProjectListTable } from '../features/projects/ProjectListTable';
import { ProjectFormModal } from '../features/projects/ProjectFormModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import type { ProjectFilterParams, ProjectStatus } from '../types/project.types';

export const ProjectsPage: React.FC = () => {
  const [filters, setFilters] = useState<ProjectFilterParams>({
    page: 1,
    limit: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const { data: projectsData, isLoading } = useProjects(filters);
  const { data: clientsData } = useClients({ limit: 100 });
  const createProject = useCreateProject();
  const updateStatus = useUpdateProjectStatus();

  const handleStatusChange = (id: string, status: ProjectStatus) => {
    void updateStatus.mutateAsync({ id, status });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Projetos, Prazos e Entregas
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie o status dos serviços, prazos de entrega e saldos financeiros.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </button>
      </div>

      <ProjectFiltersBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !projectsData || projectsData.data.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description="Crie um novo projeto ou ajuste os filtros selecionados."
        />
      ) : (
        <ProjectListTable
          projects={projectsData.data}
          onStatusChange={handleStatusChange}
        />
      )}

      <ProjectFormModal
        isOpen={modalOpen}
        clients={clientsData?.data || []}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          await createProject.mutateAsync(payload);
        }}
      />
    </div>
  );
};

