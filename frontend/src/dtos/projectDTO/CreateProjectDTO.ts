// Developed by Mateo Garcia Carreno

// Internal imports
import type { ProjectInterface } from '@/interfaces/ProjectInterface';

export type CreateProjectDTO = Omit<
  ProjectInterface,
  'id' | 'createdAt' | 'updatedAt' | 'userIds' | 'progress' | 'taskCount'
>;
