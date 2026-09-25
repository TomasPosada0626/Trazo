// Author: Mateo Garcia Carreno

// internal imports
import type { SelectOption } from '@/components/shared/SelectFieldComponent.vue';
import type { BadgeTone } from '@/components/shared/StatusBadgeComponent.vue';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import type { TaskPriority, TaskStatus, TaskType } from '@/interfaces/TaskInterface';
import type { UserRole } from '@/interfaces/UserInterface';

interface LabelDescriptor {
  text: string;
  tone: BadgeTone;
}

export class LabelUtils {
  static readonly PROJECT_STATUS: Record<ProjectStatus, LabelDescriptor> = {
    planning: { text: 'Planned', tone: 'neutral' },
    active: { text: 'Active', tone: 'positive' },
    at_risk: { text: 'At risk', tone: 'warning' },
    paused: { text: 'Paused', tone: 'neutral' },
    completed: { text: 'Closed', tone: 'neutral' },
  };

  static readonly SPRINT_STATUS: Record<SprintStatus, LabelDescriptor> = {
    planned: { text: 'Planned', tone: 'neutral' },
    active: { text: 'In progress', tone: 'warning' },
    completed: { text: 'Closed', tone: 'neutral' },
  };

  static readonly TASK_STATUS: Record<TaskStatus, LabelDescriptor> = {
    todo: { text: 'To do', tone: 'neutral' },
    in_progress: { text: 'In progress', tone: 'warning' },
    done: { text: 'Done', tone: 'positive' },
  };

  static readonly TASK_TYPE: Record<TaskType, LabelDescriptor> = {
    feature: { text: 'Feature', tone: 'positive' },
    bug: { text: 'Bug', tone: 'danger' },
    chore: { text: 'Chore', tone: 'neutral' },
    research: { text: 'Research', tone: 'warning' },
  };

  static readonly TASK_PRIORITY: Record<TaskPriority, LabelDescriptor> = {
    low: { text: 'Low', tone: 'neutral' },
    medium: { text: 'Medium', tone: 'neutral' },
    high: { text: 'High', tone: 'danger' },
    critical: { text: 'Critical', tone: 'danger' },
  };

  static readonly USER_ROLE: Record<UserRole, LabelDescriptor> = {
    admin: { text: 'Administrator', tone: 'positive' },
    member: { text: 'Member', tone: 'neutral' },
  };

  static toSelectOptions(labels: Record<string, LabelDescriptor>): SelectOption[] {
    return Object.entries(labels).map(([value, descriptor]) => ({
      value,
      label: descriptor.text,
    }));
  }

  static toFilterOptions(
    labels: Record<string, LabelDescriptor>,
    allLabel = 'All',
  ): SelectOption[] {
    return [{ value: 'all', label: allLabel }, ...LabelUtils.toSelectOptions(labels)];
  }
}
