import type { BadgeTone } from '@/components/StatusBadge.vue';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import type { TaskPriority, TaskStatus } from '@/interfaces/TaskInterface';
import type { UserRole } from '@/interfaces/UserInterface';

/**
 * Presentation mapping: turns the enum values stored in state into the copy
 * shown in the UI, plus the badge tone each one should use. Kept out of the
 * services, which stay free of display concerns.
 */
export interface LabelDescriptor {
  text: string;
  tone: BadgeTone;
}

export const PROJECT_STATUS: Record<ProjectStatus, LabelDescriptor> = {
  planning: { text: 'Planned', tone: 'neutral' },
  active: { text: 'Active', tone: 'positive' },
  at_risk: { text: 'At risk', tone: 'warning' },
  paused: { text: 'Paused', tone: 'neutral' },
  completed: { text: 'Closed', tone: 'neutral' },
};

export const SPRINT_STATUS: Record<SprintStatus, LabelDescriptor> = {
  planned: { text: 'Planned', tone: 'neutral' },
  active: { text: 'In progress', tone: 'warning' },
  completed: { text: 'Closed', tone: 'neutral' },
};

export const TASK_STATUS: Record<TaskStatus, LabelDescriptor> = {
  todo: { text: 'To do', tone: 'neutral' },
  in_progress: { text: 'In progress', tone: 'warning' },
  done: { text: 'Done', tone: 'positive' },
};

export const TASK_PRIORITY: Record<TaskPriority, LabelDescriptor> = {
  low: { text: 'Low', tone: 'neutral' },
  medium: { text: 'Medium', tone: 'neutral' },
  high: { text: 'High', tone: 'danger' },
  critical: { text: 'Critical', tone: 'danger' },
};

export const USER_ROLE: Record<UserRole, LabelDescriptor> = {
  admin: { text: 'Administrator', tone: 'positive' },
  member: { text: 'Member', tone: 'neutral' },
};
