import type { CreateSprintDTO } from '@/dtos/CreateSprintDTO';
import type { UpdateSprintDTO } from '@/dtos/UpdateSprintDTO';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { TaskService } from '@/services/TaskService';
import { useSprintStore } from '@/stores/sprintstore';
import { nextId } from '@/utils/id';
import { daysBetween, startOfToday } from '@/utils/date';

export class SprintService {
  /** Every sprint of a project, in seeded order. */
  static getByProject(projectId: number): SprintInterface[] {
    return useSprintStore().sprints.filter((sprint) => sprint.projectId === projectId);
  }

  static getById(id: number): SprintInterface | undefined {
    return useSprintStore().sprints.find((sprint) => sprint.id === id);
  }

  /** Sprints currently running, i.e. `Project.getActiveSprints()` in the diagram. */
  static getActiveSprints(projectId: number): SprintInterface[] {
    return SprintService.getByProject(projectId).filter((sprint) => sprint.status === 'active');
  }

  static create(data: CreateSprintDTO): SprintInterface {
    const sprint: SprintInterface = { id: nextId(useSprintStore().sprints), ...data };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useSprintStore().sprints.push(sprint);
    return sprint;
  }

  /** Applies a partial update. No-op when the id does not exist. */
  static update(id: number, changes: UpdateSprintDTO): void {
    const sprint = SprintService.getById(id);
    if (!sprint) return;

    Object.assign(sprint, changes);
  }

  /**
   * Deletes a sprint and returns its tasks to the backlog.
   *
   * Tasks are not deleted with it: a task belongs to its project, and the
   * sprint is only where it was scheduled. Leaving a dangling `sprintId` would
   * hide those tasks from every sprint-scoped view with no way back.
   */
  static remove(id: number): void {
    const sprints = useSprintStore().sprints;
    const index = sprints.findIndex((sprint) => sprint.id === id);
    if (index === -1) return;

    TaskService.getBySprint(id).forEach((task) => TaskService.setSprint(task.id, null));

    sprints.splice(index, 1);
  }

  /**
   * Deletes every sprint of a project, for the cascade in ProjectService.
   *
   * Delegates to remove() per sprint so the task-unscheduling behaviour stays
   * in one place. getByProject returns a fresh array, so splicing the store
   * while iterating it is safe.
   *
   * @param projectId Id of the project being deleted.
   */
  static removeByProject(projectId: number): void {
    SprintService.getByProject(projectId).forEach((sprint) => SprintService.remove(sprint.id));
  }

  /** The tasks scheduled into this sprint. */
  static getTasks(sprint: SprintInterface): TaskInterface[] {
    return TaskService.getBySprint(sprint.id);
  }

  /**
   * Replaces the sprint's task list.
   *
   * The relation lives on the task (`task.sprintId`), so scheduling work is a
   * write across tasks rather than a field on the sprint. Only tasks of the
   * sprint's own project are considered: selecting one that sits in a sibling
   * sprint moves it here, deselecting one returns it to the backlog, and a
   * task belonging to another sprint that was never selected is left alone.
   *
   * Passing an empty array clears the sprint, which is a valid state — a
   * sprint can be planned before any work is scheduled into it.
   */
  static setTasks(sprintId: number, taskIds: number[]): void {
    const sprint = SprintService.getById(sprintId);
    if (!sprint) return;

    const selected = new Set(taskIds);

    // Scoped to the sprint's own project, so a task can never point at a
    // sprint that belongs somewhere else.
    TaskService.getByProject(sprint.projectId).forEach((task) => {
      if (selected.has(task.id)) {
        TaskService.setSprint(task.id, sprintId);
      } else if (task.sprintId === sprintId) {
        TaskService.setSprint(task.id, null);
      }
    });
  }

  /**
   * Story points scheduled into the sprint, whatever their status.
   *
   * Derived rather than stored: with tasks editable from the sprint form, a
   * typed commitment would contradict the visible work the moment either side
   * changed.
   */
  static getTotalCommittedPoints(sprint: SprintInterface): number {
    return SprintService.getTasks(sprint).reduce((total, task) => total + task.storyPoints, 0);
  }

  /**
   * Story points delivered so far — the diagram's `getTotalCompletedPoints()`.
   * Derived rather than stored, so it cannot go stale when a task changes
   * status.
   */
  static getTotalCompletedPoints(sprint: SprintInterface): number {
    return SprintService.getTasks(sprint)
      .filter((task) => task.status === 'done')
      .reduce((total, task) => total + task.storyPoints, 0);
  }

  /**
   * Delivered points as a share of what was scheduled, 0–100.
   *
   * A sprint with no tasks reports 0 rather than 100: nothing was delivered,
   * and dividing by zero would claim otherwise.
   */
  static calculateCompletionPercentage(sprint: SprintInterface): number {
    const committed = SprintService.getTotalCommittedPoints(sprint);
    if (committed <= 0) return 0;

    return Math.round((SprintService.getTotalCompletedPoints(sprint) / committed) * 100);
  }

  /**
   * Average points delivered per finished sprint — the diagram's
   * `calculateVelocity()`.
   *
   * Only completed sprints count: an in-flight sprint has not had its chance
   * to deliver yet, and including it would drag the average down every time.
   */
  static calculateVelocity(projectId: number): number {
    const finished = SprintService.getByProject(projectId).filter(
      (sprint) => sprint.status === 'completed',
    );
    if (!finished.length) return 0;

    const total = finished.reduce(
      (sum, sprint) => sum + SprintService.getTotalCompletedPoints(sprint),
      0,
    );

    return Math.round(total / finished.length);
  }

  /**
   * Whole days left until the sprint ends, floored at 0.
   *
   * Returns 0 for a sprint that has already ended rather than a negative
   * number, since the UI reads it as "days remaining".
   */
  static getRemainingDays(sprint: SprintInterface): number {
    return Math.max(0, daysBetween(startOfToday(), sprint.endDate));
  }
}
