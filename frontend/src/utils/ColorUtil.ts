// Developed by Mateo Garcia Carreno

// Internal imports
import type { ProjectStatus } from '@/types/ProjectTypes';
import type { SprintStatus } from '@/types/SprintTypes';
import type { TaskStatus, TaskType } from '@/types/TaskTypes';

export class ColorUtil {
  static readonly PROJECT_STATUS: Record<ProjectStatus, string> = {
    planning: '#94a3b8',
    active: '#059669',
    at_risk: '#f59e0b',
    paused: '#8b5cf6',
    completed: '#334155',
  };

  static readonly SPRINT_STATUS: Record<SprintStatus, string> = {
    planned: '#94a3b8',
    active: '#f59e0b',
    completed: '#059669',
  };

  static readonly TASK_STATUS: Record<TaskStatus, string> = {
    todo: '#94a3b8',
    in_progress: '#f59e0b',
    done: '#059669',
  };

  static readonly TASK_TYPE: Record<TaskType, string> = {
    feature: '#059669',
    bug: '#ef4444',
    chore: '#94a3b8',
    research: '#f59e0b',
  };

  static readonly CHART = {
    ink: '#0d3355',
    done: '#059669',
    muted: '#a9bacd',
  };
}
