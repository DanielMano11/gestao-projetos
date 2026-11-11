import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  useAddProjectPayment,
  useProjectDetail,
  useRemoveProjectPayment,
  useUpdateProjectFinancials,
  useUpdateProjectStatus,
} from '../hooks/useProjects';
import {
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from '../hooks/useTasks';
import { ProjectStatusSelect } from '../features/projects/ProjectStatusSelect';
import { DeadlineAlertBadge } from '../components/ui/DeadlineAlertBadge';
import { ProjectChecklistPanel } from '../features/projects/ProjectChecklistPanel';
import { ProjectFinancialCard } from '../features/projects/ProjectFinancialCard';
import { Skeleton } from '../components/ui/Skeleton';

export const ProjectDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProjectDetail(id);
  const updateStatus = useUpdateProjectStatus();
  const updateFinancials = useUpdateProjectFinancials();
  const addPayment = useAddProjectPayment();
  const removePayment = useRemoveProjectPayment();
  const createTask = useCreateTask(id);
  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask(id);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Projeto não encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Projetos
      </Link>

      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
          {project.client && (
            <p className="text-xs text-slate-500">
              Cliente:{' '}
              <Link
                to={`/clients/${project.client.id}`}
                className="font-semibold text-indigo-600 hover:underline"
              >
                {project.client.name}
              </Link>
            </p>
          )}
          {project.description && (
            <p className="text-sm text-slate-600">{project.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DeadlineAlertBadge
            deadline={project.deadline}
            status={project.status}
            daysRemaining={project.daysRemaining}
            isOverdue={project.isOverdue}
            isUrgent={project.isUrgent}
          />
          <ProjectStatusSelect
            value={project.status}
            onChange={(status) => updateStatus.mutate({ id: project.id, status })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectChecklistPanel
          tasks={project.tasks || []}
          progressPercentage={project.progressPercentage}
          onAddTask={async (title) => {
            await createTask.mutateAsync({ title });
          }}
          onToggleTask={async (taskId, isCompleted) => {
            await updateTask.mutateAsync({
              taskId,
              payload: { isCompleted },
            });
          }}
          onDeleteTask={async (taskId) => {
            await deleteTask.mutateAsync(taskId);
          }}
        />

        <ProjectFinancialCard
          chargedAmount={project.chargedAmount}
          paidAmount={project.paidAmount}
          receivableAmount={project.receivableAmount}
          financialStatus={project.financialStatus}
          payments={project.payments}
          onUpdateDirect={async (payload) => {
            await updateFinancials.mutateAsync({ id: project.id, payload });
          }}
          onAddPayment={async (payload) => {
            await addPayment.mutateAsync({ projectId: project.id, payload });
          }}
          onRemovePayment={async (paymentId) => {
            await removePayment.mutateAsync(paymentId);
          }}
        />
      </div>
    </div>
  );
};

