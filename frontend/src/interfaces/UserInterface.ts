// Author: Mateo Garcia Carreno

/**
 * Role decides what a user can reach. `admin` unlocks the admin panel;
 * `member` only sees the projects they belong to.
 */
export type UserRole = 'admin' | 'member';

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  /** Plain text, LocalStorage-only MVP. Never do this in a real app. */
  password: string;
  role: UserRole;
}
