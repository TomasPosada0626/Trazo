// Author: Mateo Garcia Carreno

// external imports
import axios from 'axios';

// internal imports
import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';
import type { UpdateProjectDTO } from '@/dtos/UpdateProjectDTO';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import type { UserInterface } from '@/interfaces/UserInterface';

export class ProjectService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/projects`;

  static async getAll(): Promise<ProjectInterface[]> {
    const { data } = await axios.get<ProjectInterface[]>(ProjectService.API_URL);
    return data;
  }

  static async getById(id: number): Promise<ProjectInterface> {
    const { data } = await axios.get<ProjectInterface>(`${ProjectService.API_URL}/${id}`);
    return data;
  }

  static async create(createProjectDTO: CreateProjectDTO): Promise<ProjectInterface> {
    const { data } = await axios.post<ProjectInterface>(ProjectService.API_URL, createProjectDTO);
    return data;
  }

  static async update(id: number, changes: UpdateProjectDTO): Promise<ProjectInterface> {
    const { data } = await axios.patch<ProjectInterface>(
      `${ProjectService.API_URL}/${id}`,
      changes,
    );
    return data;
  }

  static async remove(id: number): Promise<void> {
    await axios.delete(`${ProjectService.API_URL}/${id}`);
  }

  static async getUsers(id: number): Promise<UserInterface[]> {
    const { data } = await axios.get<UserInterface[]>(`${ProjectService.API_URL}/${id}/users`);
    return data;
  }

  static async getAvailableUsers(id: number): Promise<UserInterface[]> {
    const { data } = await axios.get<UserInterface[]>(
      `${ProjectService.API_URL}/${id}/available-users`,
    );
    return data;
  }

  static async addUser(id: number, userId: number): Promise<UserInterface[]> {
    const { data } = await axios.post<UserInterface[]>(`${ProjectService.API_URL}/${id}/users`, {
      userId,
    });
    return data;
  }

  static async removeUser(id: number, userId: number): Promise<UserInterface[]> {
    const { data } = await axios.delete<UserInterface[]>(
      `${ProjectService.API_URL}/${id}/users/${userId}`,
    );
    return data;
  }
}
