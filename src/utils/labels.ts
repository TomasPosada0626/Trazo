import type { BadgeTone } from '@/components/StatusBadge.vue';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import type { TaskPriority, TaskStatus } from '@/interfaces/TaskInterface';
import type { UserRole } from '@/interfaces/UserInterface';

/**
 * Presentation mapping: turns the English enum values stored in state into the
 * Spanish copy shown in the UI, plus the badge tone each one should use.
 * Kept out of the services, which stay free of display concerns.
 */
export interface LabelDescriptor {
  text: string;
  tone: BadgeTone;
}

export const PROJECT_STATUS: Record<ProjectStatus, LabelDescriptor> = {
  planning: { text: 'Planeado', tone: 'neutral' },
  active: { text: 'Activo', tone: 'positive' },
  at_risk: { text: 'En riesgo', tone: 'warning' },
  paused: { text: 'En pausa', tone: 'neutral' },
  completed: { text: 'Cerrado', tone: 'neutral' },
};

export const SPRINT_STATUS: Record<SprintStatus, LabelDescriptor> = {
  planned: { text: 'Planeado', tone: 'neutral' },
  active: { text: 'En curso', tone: 'warning' },
  completed: { text: 'Cerrado', tone: 'neutral' },
};

export const TASK_STATUS: Record<TaskStatus, LabelDescriptor> = {
  todo: { text: 'Por hacer', tone: 'neutral' },
  in_progress: { text: 'En progreso', tone: 'warning' },
  done: { text: 'Hecho', tone: 'positive' },
};

export const TASK_PRIORITY: Record<TaskPriority, LabelDescriptor> = {
  low: { text: 'Baja', tone: 'neutral' },
  medium: { text: 'Media', tone: 'neutral' },
  high: { text: 'Alta', tone: 'danger' },
  critical: { text: 'Crítica', tone: 'danger' },
};

export const USER_ROLE: Record<UserRole, LabelDescriptor> = {
  admin: { text: 'Administrador', tone: 'positive' },
  member: { text: 'Miembro', tone: 'neutral' },
};
