// Developed by Mateo Garcia Carreno

// External imports
import axios from 'axios';

// Internal imports
import type { CreateProjectDTO } from '@/dtos/projectDTO/CreateProjectDTO';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import type { UpdateProjectDTO } from '@/dtos/projectDTO/UpdateProjectDTO';
import type { UserInterface } from '@/interfaces/UserInterface';

export class ProjectService {
  private static readonly apiUrl = import.meta.env.VITE_API_BASE_URL;

  static async getProjects(): Promise<ProjectInterface[]> {
    const response = await axios.get<ProjectInterface[]>(`${this.apiUrl}projects`);
    return response.data;
  }

  static async getProjectById(id: number): Promise<ProjectInterface> {
    const response = await axios.get<ProjectInterface>(`${this.apiUrl}projects/${id}`);
    return response.data;
  }

  static async createProject(project: CreateProjectDTO): Promise<ProjectInterface> {
    const response = await axios.post<ProjectInterface>(`${this.apiUrl}projects`, project);
    return response.data;
  }

  static async updateProject(
    project: UpdateProjectDTO,
    projectId: number,
  ): Promise<ProjectInterface> {
    const response = await axios.patch<ProjectInterface>(
      `${this.apiUrl}projects/${projectId}`,
      project,
    );
    return response.data;
  }

  static async deleteProject(id: number): Promise<void> {
    await axios.delete(`${this.apiUrl}projects/${id}`);
  }

  static async getProjectUsers(id: number): Promise<UserInterface[]> {
    const response = await axios.get<UserInterface[]>(`${this.apiUrl}projects/${id}/users`);
    return response.data;
  }

  static async getAvailableUsers(id: number): Promise<UserInterface[]> {
    const response = await axios.get<UserInterface[]>(
      `${this.apiUrl}projects/${id}/available-users`,
    );
    return response.data;
  }

  static async addProjectUser(projectId: number, userId: number): Promise<UserInterface[]> {
    const response = await axios.post<UserInterface[]>(
      `${this.apiUrl}projects/${projectId}/users`,
      { userId },
    );
    return response.data;
  }

  static async removeProjectUser(projectId: number, userId: number): Promise<UserInterface[]> {
    const response = await axios.delete<UserInterface[]>(
      `${this.apiUrl}projects/${projectId}/users/${userId}`,
    );
    return response.data;
  }
}
