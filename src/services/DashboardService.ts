// Author: Mateo Garcia Carreno

// internal imports
import type { TaskInterface, TaskStatus } from '@/interfaces/TaskInterface';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';
import { isPastDate } from '@/utils/date';
import { shortId } from '@/utils/id';

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
  /**
   * The tasks a metric should consider, honouring the range selection.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or `null` for the whole project.
   * @returns The matching tasks.
   */
  private static scopedTasks(projectId: number, sprintId: number | null): TaskInterface[] {
    const tasks = TaskService.getByProject(projectId);
    if (!sprintId) return tasks;

    return tasks.filter((task) => task.sprintId === sprintId);
  }

  /**
   * Share of scoped tasks that are done.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or `null` for the whole project.
   * @returns Completion percentage, 0 to 100.
   */
  static getProgress(projectId: number, sprintId: number | null): number {
    const tasks = DashboardService.scopedTasks(projectId, sprintId);
    if (!tasks.length) return 0;

    const done = tasks.filter((task) => task.status === 'done').length;

    return Math.round((done / tasks.length) * 100);
  }

  /**
   * Counts scoped tasks that are done.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or `null` for the whole project.
   * @returns Number of completed tasks.
   */
  static getCompletedTaskCount(projectId: number, sprintId: number | null): number {
    return DashboardService.scopedTasks(projectId, sprintId).filter(
      (task) => task.status === 'done',
    ).length;
  }

  /**
   * Counts every scoped task, regardless of status.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or `null` for the whole project.
   * @returns Total number of tasks in scope.
   */
  static getTotalTaskCount(projectId: number, sprintId: number | null): number {
    return DashboardService.scopedTasks(projectId, sprintId).length;
  }

  /**
   * Counts the project's active sprints.
   *
   * @param projectId Project to count sprints for.
   * @returns Number of sprints currently active.
   */
  static getActiveSprintCount(projectId: number): number {
    return SprintService.getActiveSprints(projectId).length;
  }

  /**
   * Unfinished tasks whose due date has passed.
   *
   * A done task is never overdue no matter when it was finished, and a task
   * without a due date cannot be late.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or `null` for the whole project.
   * @returns Number of overdue tasks.
   */
  static getOverdueTaskCount(projectId: number, sprintId: number | null): number {
    return DashboardService.scopedTasks(projectId, sprintId).filter(
      (task) => task.status !== 'done' && task.dueDate !== null && isPastDate(task.dueDate),
    ).length;
  }

  /**
   * Task counts per status, in board order.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or `null` for the whole project.
   * @returns Labels and values ready for a pie/bar chart.
   */
  static getTasksByStatus(projectId: number, sprintId: number | null): StatusSeries {
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
   *
   * @param projectId Project to build the velocity series for.
   * @returns Committed and completed points per sprint.
   */
  static getVelocitySeries(projectId: number): VelocitySeries {
    const sprints = SprintService.getByProject(projectId);

    return {
      labels: sprints.map((sprint) => shortId('SPR', sprint.id)),
      committed: sprints.map((sprint) => SprintService.getTotalCommittedPoints(sprint)),
      values: sprints.map((sprint) => SprintService.getTotalCompletedPoints(sprint)),
    };
  }

  /**
   * The signed-in member's own tasks within the current scope.
   *
   * Members never see the workload chart, which compares people against each
   * other; their dashboard answers "what is on my plate" instead. Unfinished
   * work comes first, and within that the nearest deadline, so the top of the
   * table is what to do next. Tasks with no due date sort last.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or null for the whole project.
   * @param userId The signed-in user.
   * @returns Their tasks, ordered by urgency.
   */
  static getUserTasks(projectId: number, sprintId: number | null, userId: number): TaskInterface[] {
    const farFuture = '9999-12-31';

    return DashboardService.scopedTasks(projectId, sprintId)
      .filter((task) => task.assigneeId === userId)
      .slice()
      .sort((a, b) => {
        const aDone = a.status === 'done' ? 1 : 0;
        const bDone = b.status === 'done' ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;

        return (a.dueDate ?? farFuture).localeCompare(b.dueDate ?? farFuture);
      });
  }

  /**
   * Open tasks per project member, busiest first.
   *
   * Counts only `todo` and `in_progress`: finished work is not workload.
   * Members with nothing open still appear, since an idle member is exactly
   * what this chart should reveal.
   *
   * @param projectId Project the dashboard is scoped to.
   * @param sprintId Sprint to narrow to, or `null` for the whole project.
   * @returns Labels and open-task counts, one entry per member (plus
   * "Unassigned" when applicable).
   */
  static getWorkloadByAssignee(projectId: number, sprintId: number | null): ChartSeries {
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
