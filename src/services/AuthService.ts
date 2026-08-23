import type { UserInterface } from '@/interfaces/UserInterface';
import { useAuthStore } from '@/stores/authstore';
import { useUserStore } from '@/stores/userstore';

export class AuthService {
  /** Validates credentials and starts a session. Throws if they don't match a user. */
  static login(email: string, password: string): UserInterface {
    const user = useUserStore().users.find(
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

  /** Returns the currently logged-in user, or `undefined` if there's no active session. */
  static getCurrentUser(): UserInterface | undefined {
    const currentUserId = useAuthStore().currentUserId;
    if (!currentUserId) return undefined;

    return useUserStore().users.find((user) => user.id === currentUserId);
  }

  /** True when there is an active session and it belongs to an admin. */
  static isAdmin(): boolean {
    return AuthService.getCurrentUser()?.role === 'admin';
  }
}
