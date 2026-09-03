import type { TaskInterface, TaskStatus } from '@/interfaces/TaskInterface';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { useTaskStore } from '@/stores/taskstore';
import { isPastDate } from '@/utils/date';

/** A chart-ready series: matching label and value arrays. */
export interface ChartSeries {
  labels: string[];
  values: number[];
}

/** Status counts keep the union, so callers can index label maps safely. */
export interface StatusSeries {
  labels: TaskStatus[];
  values: number[];
}

/** Velocity needs two bars per sprint, so it carries a second value array. */
export interface VelocitySeries extends ChartSeries {
  committed: number[];
}

/**
 * Cross-entity aggregation for the dashboard.
 *
 * Every method returns plain numbers or label/value arrays, so the chart
 * components stay presentational and never reach into a store themselves.
 *
 * `sprintId` narrows a metric to one sprint; `null` means the whole project.
 */
export class DashboardService {
  /** The tasks a metric should consider, honouring the range selection. */
  private static scopedTasks(projectId: string, sprintId: string | null): TaskInterface[] {
    const tasks = useTaskStore().tasks.filter((task) => task.projectId === projectId);
    if (!sprintId) return tasks;

    return tasks.filter((task) => task.sprintId === sprintId);
  }

  /** Share of scoped tasks that are done, 0–100. */
  static getProgress(projectId: string, sprintId: string | null): number {
    const tasks = DashboardService.scopedTasks(projectId, sprintId);
    if (!tasks.length) return 0;

    const done = tasks.filter((task) => task.status === 'done').length;

    return Math.round((done / tasks.length) * 100);
  }

  static getCompletedTaskCount(projectId: string, sprintId: string | null): number {
    return DashboardService.scopedTasks(projectId, sprintId).filter(
      (task) => task.status === 'done',
    ).length;
  }

  static getTotalTaskCount(projectId: string, sprintId: string | null): number {
    return DashboardService.scopedTasks(projectId, sprintId).length;
  }

  static getActiveSprintCount(projectId: string): number {
    return SprintService.getActiveSprints(projectId).length;
  }

  /**
   * Unfinished tasks whose due date has passed.
   *
   * A done task is never overdue no matter when it was finished, and a task
   * without a due date cannot be late.
   */
  static getOverdueTaskCount(projectId: string, sprintId: string | null): number {
    return DashboardService.scopedTasks(projectId, sprintId).filter(
      (task) => task.status !== 'done' && task.dueDate !== null && isPastDate(task.dueDate),
    ).length;
  }

  /** Task counts per status, in board order. */
  static getTasksByStatus(projectId: string, sprintId: string | null): StatusSeries {
    const tasks = DashboardService.scopedTasks(projectId, sprintId);
    const order: TaskStatus[] = ['todo', 'in_progress', 'done'];

    return {
      labels: order,
      values: order.map((status) => tasks.filter((task) => task.status === status).length),
    };
  }

  /**
   * Committed against delivered points for every sprint of the project.
   *
   * Always spans the whole project: a velocity chart of a single sprint would
   * be one pair of bars with nothing to compare against.
   */
  static getVelocitySeries(projectId: string): VelocitySeries {
    const sprints = SprintService.getByProject(projectId);

    return {
      labels: sprints.map((sprint) => sprint.id),
      committed: sprints.map((sprint) => sprint.totalCommittedPoints),
      values: sprints.map((sprint) => SprintService.getTotalCompletedPoints(sprint)),
    };
  }

  /**
   * Open tasks per project member, busiest first.
   *
   * Counts only `todo` and `in_progress`: finished work is not workload.
   * Members with nothing open still appear, since an idle member is exactly
   * what this chart should reveal.
   */
  static getWorkloadByAssignee(projectId: string, sprintId: string | null): ChartSeries {
    const project = ProjectService.getById(projectId);
    if (!project) return { labels: [], values: [] };

    const open = DashboardService.scopedTasks(projectId, sprintId).filter(
      (task) => task.status !== 'done',
    );

    const rows = ProjectService.getMembers(project).map((member) => ({
      label: member.name,
      value: open.filter((task) => task.assigneeId === member.id).length,
    }));

    const unassigned = open.filter((task) => task.assigneeId === null).length;
    if (unassigned > 0) {
      rows.push({ label: 'Unassigned', value: unassigned });
    }

    rows.sort((a, b) => b.value - a.value);

    return { labels: rows.map((r) => r.label), values: rows.map((r) => r.value) };
  }
}
