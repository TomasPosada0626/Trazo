// Author: Mateo Garcia Carreno

// external imports
import axios from 'axios';

// internal imports
import type { TaskInterface, TaskStatus } from '@/interfaces/TaskInterface';

export class DashboardService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`;

  static async get(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all',
  ): Promise<{
    progress: number;
    activeSprints: number;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    tasksByStatus: { labels: TaskStatus[]; values: number[] };
    tasksByProject: { labels: string[]; values: number[] };
    velocity: { sprintIds: number[]; committed: number[]; completed: number[] };
    workload: { name: string | null; openTasks: number }[] | null;
    userTasks: TaskInterface[];
  }> {
    const { data } = await axios.get(DashboardService.API_URL, {
      params: {
        projectId,
        sprintId: sprintId ?? undefined,
        status: status === 'all' ? undefined : status,
      },
    });
    return data;
  }
}
