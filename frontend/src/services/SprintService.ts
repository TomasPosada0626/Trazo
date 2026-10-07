// Developed by Hever-Alfonso

// External imports
import axios from 'axios';

// Internal imports
import type { CreateSprintDTO } from '@/dtos/sprintDTO/CreateSprintDTO';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import type { UpdateSprintDTO } from '@/dtos/sprintDTO/UpdateSprintDTO';

export class SprintService {
  private static readonly apiUrl = import.meta.env.VITE_API_BASE_URL;

  static async getSprints(projectId?: number): Promise<SprintInterface[]> {
    const response = await axios.get<SprintInterface[]>(`${this.apiUrl}sprints`, {
      params: { projectId },
    });
    return response.data;
  }

  static async getSprintById(id: number): Promise<SprintInterface> {
    const response = await axios.get<SprintInterface>(`${this.apiUrl}sprints/${id}`);
    return response.data;
  }

  static async createSprint(sprint: CreateSprintDTO): Promise<SprintInterface> {
    const response = await axios.post<SprintInterface>(`${this.apiUrl}sprints`, sprint);
    return response.data;
  }

  static async updateSprint(sprint: UpdateSprintDTO, sprintId: number): Promise<SprintInterface> {
    const response = await axios.patch<SprintInterface>(
      `${this.apiUrl}sprints/${sprintId}`,
      sprint,
    );
    return response.data;
  }

  static async deleteSprint(id: number): Promise<void> {
    await axios.delete(`${this.apiUrl}sprints/${id}`);
  }
}
