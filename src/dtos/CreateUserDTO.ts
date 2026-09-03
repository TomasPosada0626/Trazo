// Author: Tomás Posada

// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

/** `id` is assigned by UserService.create(), so it is not caller input. */
export type CreateUserDTO = Omit<UserInterface, 'id'>;
