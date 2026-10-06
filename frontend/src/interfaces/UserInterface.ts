// Author: Mateo Garcia Carreno

export type UserRole = 'admin' | 'member';

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  activeProjects?: number;
}
