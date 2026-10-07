// Developed by Hever-Alfonso

// External imports
import axios from 'axios';

// Internal imports
import type { CreateTaskDTO } from '@/dtos/taskDTO/CreateTaskDTO';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import type { TaskStatus } from '@/types/TaskTypes';
import type { UpdateTaskDTO } from '@/dtos/taskDTO/UpdateTaskDTO';

export class TaskService {
  private static readonly apiUrl = import.meta.env.VITE_API_BASE_URL;

  static async getTasks(projectId: number | 'all' = 'all'): Promise<TaskInterface[]> {
    const response = await axios.get<TaskInterface[]>(`${this.apiUrl}tasks`, {
      params: { projectId: projectId === 'all' ? undefined : projectId },
    });
    return response.data;
  }

  static async getTaskStats(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all',
  ): Promise<{
    progress: number;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    tasksByStatus: { labels: TaskStatus[]; values: number[] };
    workload: { name: string | null; openTasks: number }[] | null;
    userTasks: TaskInterface[];
  }> {
    const response = await axios.get(`${this.apiUrl}tasks/stats`, {
      params: {
        projectId,
        sprintId: sprintId ?? undefined,
        status: status === 'all' ? undefined : status,
      },
    });
    return response.data;
  }

  static async getTaskById(id: number): Promise<TaskInterface> {
    const response = await axios.get<TaskInterface>(`${this.apiUrl}tasks/${id}`);
    return response.data;
  }

  static async createTask(task: CreateTaskDTO): Promise<TaskInterface> {
    const response = await axios.post<TaskInterface>(`${this.apiUrl}tasks`, task);
    return response.data;
  }

  static async updateTask(task: UpdateTaskDTO, taskId: number): Promise<TaskInterface> {
    const response = await axios.patch<TaskInterface>(`${this.apiUrl}tasks/${taskId}`, task);
    return response.data;
  }

  static async deleteTask(id: number): Promise<void> {
    await axios.delete(`${this.apiUrl}tasks/${id}`);
  }
}
