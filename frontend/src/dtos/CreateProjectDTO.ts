// Author: Mateo Garcia Carreno

// internal imports
import type { ProjectInterface } from '@/interfaces/ProjectInterface';

/**
 * `id` and `createdAt` are assigned by ProjectService.create(), and
 * `memberIds` is seeded with the creator, so none of them are caller input.
 */
export type CreateProjectDTO = Omit<ProjectInterface, 'id' | 'createdAt' | 'memberIds'>;
