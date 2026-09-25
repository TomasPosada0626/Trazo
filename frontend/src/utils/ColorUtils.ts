// Author: Mateo Garcia Carreno

// internal imports
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import type { TaskStatus, TaskType } from '@/interfaces/TaskInterface';

export class ColorUtils {
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

  // For charts with no matching enum, like velocity's committed-vs-completed
  // bars. Drawn from the Tailwind theme tokens in input.css.
  static readonly CHART = {
    ink: '#0d3355',
    done: '#059669',
    muted: '#a9bacd',
  };
}
