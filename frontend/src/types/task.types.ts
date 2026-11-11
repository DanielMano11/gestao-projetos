export interface Task {
  id: string;
  projectId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistResponse {
  items: Task[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

export interface CreateTaskInput {
  title: string;
  position?: number;
}

export interface UpdateTaskInput {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

