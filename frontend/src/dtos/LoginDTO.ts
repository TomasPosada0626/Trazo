// Author: Tomás Posada

// internal imports
import type { CreateUserDTO } from '@/dtos/CreateUserDTO';

export type LoginDTO = Pick<CreateUserDTO, 'email' | 'password'>;
