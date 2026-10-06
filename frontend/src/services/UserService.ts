// Author: Tomás Posada

// external imports
import axios from 'axios';

// internal imports
import type { CreateUserDTO } from '@/dtos/CreateUserDTO';
import type { UpdateUserDTO } from '@/dtos/UpdateUserDTO';
import type { UserInterface } from '@/interfaces/UserInterface';

export class UserService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;

  static async getAll(): Promise<UserInterface[]> {
    const { data } = await axios.get<UserInterface[]>(UserService.API_URL);
    return data;
  }

  static async getById(id: number): Promise<UserInterface> {
    const { data } = await axios.get<UserInterface>(`${UserService.API_URL}/${id}`);
    return data;
  }

  static async create(createUserDTO: CreateUserDTO): Promise<UserInterface> {
    const { data } = await axios.post<UserInterface>(UserService.API_URL, createUserDTO);
    return data;
  }

  static async update(id: number, changes: UpdateUserDTO): Promise<UserInterface> {
    const { data } = await axios.patch<UserInterface>(`${UserService.API_URL}/${id}`, changes);
    return data;
  }

  static async remove(id: number): Promise<void> {
    await axios.delete(`${UserService.API_URL}/${id}`);
  }
}
