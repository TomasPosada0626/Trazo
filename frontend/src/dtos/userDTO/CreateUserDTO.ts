// Developed by Tomás Posada

// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

export type CreateUserDTO = Omit<
  UserInterface,
  'id' | 'createdAt' | 'updatedAt' | 'activeProjects'
> & { password: string };
