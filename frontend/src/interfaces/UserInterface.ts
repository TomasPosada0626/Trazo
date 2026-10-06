// Developed by Mateo Garcia Carreno

// Internal imports
import type { UserRole } from '@/types/UserTypes';

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  activeProjects?: number;
}
