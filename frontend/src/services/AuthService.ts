// Developed by Tomás Posada

// External imports
import axios from 'axios';

// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface';
import { useAuthStore } from '@/stores/authstore';

export class AuthService {
  private static readonly apiUrl = import.meta.env.VITE_API_BASE_URL;
  private static readonly tokenKey = 'access_token';

  static async logInUser(email: string, password: string): Promise<void> {
    const response = await axios.post<{ access_token: string }>(`${this.apiUrl}auth/login`, {
      email,
      password,
    });

    localStorage.setItem(this.tokenKey, response.data.access_token);

    await this.loadLoggedInUser();
  }

  static async loadLoggedInUser(): Promise<void> {
    if (!this.getAccessToken()) {
      return;
    }

    try {
      const response = await axios.get<UserInterface>(`${this.apiUrl}auth/profile`);
      useAuthStore().currentUser = response.data;
    } catch {
      this.logOutUser();
    }
  }

  static logOutUser(): void {
    localStorage.removeItem(this.tokenKey);
    useAuthStore().currentUser = null;
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static getLoggedInUser(): UserInterface | undefined {
    return useAuthStore().currentUser ?? undefined;
  }

  static isAdmin(): boolean {
    return this.getLoggedInUser()?.role === 'admin';
  }
}
