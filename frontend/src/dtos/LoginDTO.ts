// Author: Tomás Posada

// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

/** Credentials submitted from the login form. */
export type LoginDTO = Pick<UserInterface, 'email' | 'password'>;
