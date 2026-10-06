// Author: Hever-Alfonso

// external imports
import axios from 'axios';

// internal imports
import type { CreateSprintDTO } from '@/dtos/CreateSprintDTO';
import type { UpdateSprintDTO } from '@/dtos/UpdateSprintDTO';
import type { SprintInterface } from '@/interfaces/SprintInterface';

export class SprintService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/sprints`;

  static async getAll(projectId?: number): Promise<SprintInterface[]> {
    const { data } = await axios.get<SprintInterface[]>(SprintService.API_URL, {
      params: { projectId },
    });
    return data;
  }

  static async getById(id: number): Promise<SprintInterface> {
    const { data } = await axios.get<SprintInterface>(`${SprintService.API_URL}/${id}`);
    return data;
  }

  static async create(createSprintDTO: CreateSprintDTO): Promise<SprintInterface> {
    const { data } = await axios.post<SprintInterface>(SprintService.API_URL, createSprintDTO);
    return data;
  }

  static async update(id: number, changes: UpdateSprintDTO): Promise<SprintInterface> {
    const { data } = await axios.patch<SprintInterface>(`${SprintService.API_URL}/${id}`, changes);
    return data;
  }

  static async remove(id: number): Promise<void> {
    await axios.delete(`${SprintService.API_URL}/${id}`);
  }
}
