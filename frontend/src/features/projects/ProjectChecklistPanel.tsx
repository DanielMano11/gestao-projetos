import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ProgressBar } from '../../components/ui/ProgressBar';
import type { Task } from '../../types/task.types';

interface ProjectChecklistPanelProps {
  tasks: Task[];
  progressPercentage: number;
  onAddTask: (title: string) => Promise<void> | void;
  onToggleTask: (taskId: string, isCompleted: boolean) => Promise<void> | void;
  onDeleteTask: (taskId: string) => Promise<void> | void;
}

export const ProjectChecklistPanel: React.FC<ProjectChecklistPanelProps> = ({
  tasks,
  progressPercentage,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          Checklist de Entregas
        </h3>
      </div>

      <ProgressBar
        percentage={progressPercentage}
        completedCount={completedCount}
        totalCount={tasks.length}
      />

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="Adicionar nova entrega ou tarefa..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-500">
          Nenhuma tarefa cadastrada neste projeto (progresso 0%).
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={(e) => onToggleTask(task.id, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                <span
                  className={
                    task.isCompleted
                      ? 'text-slate-400 line-through'
                      : 'text-slate-800'
                  }
                >
                  {task.title}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`Remover tarefa ${task.title}`}
                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

