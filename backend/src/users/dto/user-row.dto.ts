// Author: Mateo Garcia Carreno

// internal imports
import type { User } from '../entities/user.entity.js';

export type UserRowDto = User & { activeProjects: number };
