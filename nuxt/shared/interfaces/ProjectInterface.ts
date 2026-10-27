// Developed by Mateo Garcia Carreno

// Internal imports
import type { ProjectStatus } from '#shared/types/ProjectTypes';
import type { SprintInterface } from '#shared/interfaces/SprintInterface';

export interface ProjectInterface {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  taskCount: number;
  users: string[];
  sprints: SprintInterface[];
}
