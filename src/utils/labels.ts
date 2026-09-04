// Author: Mateo Garcia Carreno

// internal imports
import type { SelectOption } from '@/components/ui/SelectFieldComponent.vue';
import type { BadgeTone } from '@/components/ui/StatusBadgeComponent.vue';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import type { TaskPriority, TaskStatus, TaskType } from '@/interfaces/TaskInterface';
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

export const TASK_TYPE: Record<TaskType, LabelDescriptor> = {
  feature: { text: 'Feature', tone: 'positive' },
  bug: { text: 'Bug', tone: 'danger' },
  chore: { text: 'Chore', tone: 'neutral' },
  research: { text: 'Research', tone: 'warning' },
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

/**
 * Chart.js slice colours, one hex per enum value. Kept alongside the badge
 * tones above rather than redefined per chart, so a status or type reads the
 * same colour everywhere — the dashboard's pie, a listing page's own chart,
 * and the badges all draw from the same map.
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#94a3b8',
  in_progress: '#f59e0b',
  done: '#059669',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: '#94a3b8',
  active: '#059669',
  at_risk: '#f59e0b',
  paused: '#8b5cf6',
  completed: '#334155',
};

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  feature: '#059669',
  bug: '#ef4444',
  chore: '#94a3b8',
  research: '#f59e0b',
};

/** General-purpose palette for charts with no matching enum (e.g. velocity's
 * committed-vs-completed bars), drawn from the Tailwind theme tokens in
 * input.css. */
export const CHART_COLORS = {
  ink: '#0d3355',
  done: '#059669',
  muted: '#a9bacd',
};

/**
 * Turns a label map into <SelectFieldComponent> options, in declaration order.
 *
 * Every dropdown over an enum derives its options from the same map the badges
 * read, so a new status shows up in the forms and the filters at once and the
 * wording can never drift between them.
 *
 * @param labels The label map to convert.
 * @returns One select option per entry, in declaration order.
 */
export function toSelectOptions<T extends string>(
  labels: Record<T, LabelDescriptor>,
): SelectOption[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value].text }));
}

/**
 * Same as {@link toSelectOptions}, prefixed with the catch-all entry the table
 * filters use.
 *
 * @param labels The label map to convert.
 * @param allLabel Text for the leading "all" option.
 * @returns The catch-all option followed by one per entry.
 */
export function toFilterOptions<T extends string>(
  labels: Record<T, LabelDescriptor>,
  allLabel = 'All',
): SelectOption[] {
  return [{ value: 'all', label: allLabel }, ...toSelectOptions(labels)];
}
