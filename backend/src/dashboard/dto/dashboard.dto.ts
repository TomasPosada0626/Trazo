// Author: Mateo Garcia Carreno

// internal imports
import type { Task, TaskStatus } from '../../tasks/entities/task.entity.js';

export type DashboardDto = {
  progress: number;
  activeSprints: number;
  completedTasks: number;
  totalTasks: number;
  overdueTasks: number;
  tasksByStatus: { labels: TaskStatus[]; values: number[] };
  tasksByProject: { labels: string[]; values: number[] };
  velocity: { sprintIds: number[]; committed: number[]; completed: number[] };
  workload: { name: string | null; openTasks: number }[] | null;
  userTasks: Task[];
};
