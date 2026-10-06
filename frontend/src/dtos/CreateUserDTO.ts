// Author: Tomás Posada

// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

export type CreateUserDTO = Omit<UserInterface, 'id'> & { password: string };
