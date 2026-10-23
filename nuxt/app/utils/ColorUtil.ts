// Developed by Mateo Garcia Carreno

// Internal imports
import type { ProjectStatus } from '#shared/types/ProjectTypes';
import type { SprintStatus } from '#shared/types/SprintTypes';

export class ColorUtil {
  static readonly PROJECT_STATUS: Record<ProjectStatus, string> = {
    planning: 'secondary',
    active: 'success',
    at_risk: 'warning',
    paused: 'info',
    completed: 'dark',
  };

  static readonly SPRINT_STATUS: Record<SprintStatus, string> = {
    planned: 'secondary',
    active: 'warning',
    completed: 'success',
  };
}
