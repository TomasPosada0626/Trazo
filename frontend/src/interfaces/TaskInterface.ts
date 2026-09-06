// Author: Mateo Garcia Carreno

export type TaskType = 'feature' | 'bug' | 'chore' | 'research';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskInterface {
  id: number;
  title: string;
  description: string;
  type: TaskType;
  storyPoints: number;
  priority: TaskPriority;
  status: TaskStatus;
  /** ISO 8601 string. */
  createdAt: string;
  /** ISO 8601 string, or null when the task has no deadline. */
  dueDate: string | null;
  projectId: number;
  /** Null while the task sits in the backlog, unassigned to any sprint. */
  sprintId: number | null;
  /** Null while nobody has picked the task up. */
  assigneeId: number | null;
}
