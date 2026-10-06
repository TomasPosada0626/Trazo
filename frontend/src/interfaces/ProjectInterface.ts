// Developed by Mateo Garcia Carreno

// Internal imports
import type { ProjectStatus } from '@/types/ProjectTypes';

export interface ProjectInterface {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  userIds: number[];
  progress?: number;
  taskCount?: number;
}
