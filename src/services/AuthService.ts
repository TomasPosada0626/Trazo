// Author: Tomás Posada

// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';
import { UserService } from '@/services/UserService';
import { useAuthStore } from '@/stores/authstore';

export class AuthService {
  /**
   * Validates credentials and starts a session.
   *
   * @param email Email of the user trying to log in.
   * @param password Plain-text password to check against the stored one.
   * @returns The authenticated user.
   * @throws {Error} When no user matches the given email and password.
   */
  static login(email: string, password: string): UserInterface {
    const user = UserService.getAll().find(
      (candidate) => candidate.email === email && candidate.password === password,
    );
    if (!user) {
      throw new Error('Incorrect email or password.');
    }

    useAuthStore().currentUserId = user.id;
    return user;
  }

  /** Ends the active session. */
  static logout(): void {
    useAuthStore().currentUserId = null;
  }

  /**
   * Returns the currently logged-in user.
   *
   * @returns The signed-in user, or `undefined` if there's no active session.
   */
  static getCurrentUser(): UserInterface | undefined {
    const currentUserId = useAuthStore().currentUserId;
    if (!currentUserId) return undefined;

    return UserService.getById(currentUserId);
  }

  /**
   * Checks whether the active session belongs to an administrator.
   *
   * @returns `true` when there is an active session and it belongs to an admin.
   */
  static isAdmin(): boolean {
    return AuthService.getCurrentUser()?.role === 'admin';
  }
}
