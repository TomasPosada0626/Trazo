// Developed by Tomás Posada

// External imports
import axios from 'axios';

// Internal imports
import type { CreateUserDTO } from '@/dtos/userDTO/CreateUserDTO';
import type { UpdateUserDTO } from '@/dtos/userDTO/UpdateUserDTO';
import type { UserInterface } from '@/interfaces/UserInterface';

export class UserService {
  private static readonly apiUrl = import.meta.env.VITE_API_BASE_URL;

  static async getUsers(): Promise<UserInterface[]> {
    const response = await axios.get<UserInterface[]>(`${this.apiUrl}users`);
    return response.data;
  }

  static async getUserById(id: number): Promise<UserInterface> {
    const response = await axios.get<UserInterface>(`${this.apiUrl}users/${id}`);
    return response.data;
  }

  static async createUser(user: CreateUserDTO): Promise<UserInterface> {
    const response = await axios.post<UserInterface>(`${this.apiUrl}users`, user);
    return response.data;
  }

  static async updateUser(user: UpdateUserDTO, userId: number): Promise<UserInterface> {
    const response = await axios.patch<UserInterface>(`${this.apiUrl}users/${userId}`, user);
    return response.data;
  }

  static async deleteUser(id: number): Promise<void> {
    await axios.delete(`${this.apiUrl}users/${id}`);
  }
}
