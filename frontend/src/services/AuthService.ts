// Author: Tomás Posada

// external imports
import axios from 'axios';

// internal imports
import type { LoginDTO } from '@/dtos/LoginDTO';
import type { UserInterface } from '@/interfaces/UserInterface';
import { useAuthStore } from '@/stores/authstore';

export class AuthService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

  static async login(credentials: LoginDTO): Promise<UserInterface> {
    const { data } = await axios.post<UserInterface>(`${AuthService.API_URL}/login`, credentials);

    useAuthStore().currentUser = data;
    return data;
  }

  static logout(): void {
    useAuthStore().currentUser = null;
  }

  static getCurrentUser(): UserInterface | undefined {
    return useAuthStore().currentUser ?? undefined;
  }

  static isAdmin(): boolean {
    return AuthService.getCurrentUser()?.role === 'admin';
  }
}
