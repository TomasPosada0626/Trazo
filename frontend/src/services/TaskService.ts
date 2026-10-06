// Author: Hever-Alfonso

// external imports
import axios from 'axios';

// internal imports
import type { CreateTaskDTO } from '@/dtos/CreateTaskDTO';
import type { UpdateTaskDTO } from '@/dtos/UpdateTaskDTO';
import type { TaskInterface } from '@/interfaces/TaskInterface';

export class TaskService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/tasks`;

  static async getAll(projectId: number | 'all' = 'all'): Promise<TaskInterface[]> {
    // 'all' is how the filter spells "every project"; the API spells it by
    // leaving the parameter out, which axios does for undefined values.
    const { data } = await axios.get<TaskInterface[]>(TaskService.API_URL, {
      params: { projectId: projectId === 'all' ? undefined : projectId },
    });
    return data;
  }

  static async getById(id: number): Promise<TaskInterface> {
    const { data } = await axios.get<TaskInterface>(`${TaskService.API_URL}/${id}`);
    return data;
  }

  static async create(createTaskDTO: CreateTaskDTO): Promise<TaskInterface> {
    const { data } = await axios.post<TaskInterface>(TaskService.API_URL, createTaskDTO);
    return data;
  }

  static async update(id: number, changes: UpdateTaskDTO): Promise<TaskInterface> {
    const { data } = await axios.patch<TaskInterface>(`${TaskService.API_URL}/${id}`, changes);
    return data;
  }

  static async remove(id: number): Promise<void> {
    await axios.delete(`${TaskService.API_URL}/${id}`);
  }
}
