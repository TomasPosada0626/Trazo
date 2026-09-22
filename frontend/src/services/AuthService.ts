// Author: Tomás Posada

// internal imports
import type { LoginDTO } from '@/dtos/LoginDTO';
import type { UserInterface } from '@/interfaces/UserInterface';
import { UserService } from '@/services/UserService';
import { useAuthStore } from '@/stores/authstore';

export class AuthService {
  static login(credentials: LoginDTO): UserInterface {
    const user = UserService.getAll().find(
      (candidate) =>
        candidate.email === credentials.email && candidate.password === credentials.password,
    );
    if (!user) {
      throw new Error('Incorrect email or password.');
    }

    useAuthStore().currentUserId = user.id;
    return user;
  }

  static logout(): void {
    useAuthStore().currentUserId = null;
  }

  static getCurrentUser(): UserInterface | undefined {
    const currentUserId = useAuthStore().currentUserId;
    if (!currentUserId) return undefined;

    return UserService.getById(currentUserId);
  }

  static isAdmin(): boolean {
    return AuthService.getCurrentUser()?.role === 'admin';
  }
}
