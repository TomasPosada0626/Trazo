// Developed by Hever-Alfonso

// Internal imports
import type { TaskPriority, TaskStatus, TaskType } from '@/types/TaskTypes';

export interface TaskInterface {
  id: number;
  title: string;
  description: string;
  type: TaskType;
  storyPoints: number;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: number;
  sprintId: number | null;
  assigneeId: number | null;
  projectName?: string;
  assigneeName?: string | null;
}
