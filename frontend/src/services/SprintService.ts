// Author: Hever-Alfonso

// internal imports
import type { CreateSprintDTO } from '@/dtos/CreateSprintDTO';
import type { UpdateSprintDTO } from '@/dtos/UpdateSprintDTO';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';
import { useSprintStore } from '@/stores/sprintstore';
import { daysBetween, startOfToday } from '@/utils/date';
import { nextId } from '@/utils/id';

export class SprintService {
  /**
   * Every sprint of a project, in seeded order.
   *
   * @param projectId Id of the owning project.
   * @returns The project's sprints, empty when it has none or does not exist.
   */
  static getByProject(projectId: number): SprintInterface[] {
    return useSprintStore().sprints.filter((sprint) => sprint.projectId === projectId);
  }

  /**
   * Finds a sprint by id.
   *
   * @param id Id of the sprint.
   * @returns The sprint, or `undefined` when no sprint carries that id.
   */
  static getById(id: number): SprintInterface | undefined {
    return useSprintStore().sprints.find((sprint) => sprint.id === id);
  }

  /**
   * Sprints currently running, i.e. `Project.getActiveSprints()` in the diagram.
   *
   * @param projectId Id of the owning project.
   * @returns The project's active sprints.
   */
  static getActiveSprints(projectId: number): SprintInterface[] {
    return SprintService.getByProject(projectId).filter((sprint) => sprint.status === 'active');
  }

  /**
   * Creates and stores a sprint with a generated id.
   *
   * @param data Sprint fields supplied by the form.
   * @returns The stored sprint.
   * @throws {Error} When the project does not exist or another sprint of the
   * same project already uses the name.
   */
  static create(data: CreateSprintDTO): SprintInterface {
    SprintService.assertValid(data.name, data.projectId);

    const sprint: SprintInterface = { id: nextId(useSprintStore().sprints), ...data };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useSprintStore().sprints.push(sprint);
    return sprint;
  }

  /**
   * Applies a partial update. No-op when the id does not exist.
   *
   * @param id Id of the sprint to update.
   * @param changes Fields to overwrite; omitted fields keep their value.
   * @throws {Error} When the name changes to one already used by another
   * sprint of the same project.
   */
  static update(id: number, changes: UpdateSprintDTO): void {
    const sprint = SprintService.getById(id);
    if (!sprint) return;

    if (changes.name !== undefined) {
      SprintService.assertValid(changes.name, changes.projectId ?? sprint.projectId, id);
    }

    Object.assign(sprint, changes);
  }

  /**
   * Guards the invariants every stored sprint has to satisfy. Kept in one
   * place so create() and update() cannot drift apart.
   *
   * @param name Name the sprint will carry.
   * @param projectId Id of the project the sprint will belong to.
   * @param excludeId Id of the sprint being edited, left out of the duplicate check.
   * @throws {Error} When the project does not exist or another sprint of the
   * same project already uses the name.
   */
  private static assertValid(name: string, projectId: number, excludeId?: number): void {
    if (!ProjectService.getById(projectId)) {
      throw new Error('The selected project does not exist.');
    }

    const normalized = name.trim().toLowerCase();
    const duplicate = SprintService.getByProject(projectId).some(
      (sprint) => sprint.id !== excludeId && sprint.name.trim().toLowerCase() === normalized,
    );
    if (duplicate) {
      throw new Error('A sprint with this name already exists in the project.');
    }
  }

  /**
   * Deletes a sprint and returns its tasks to the backlog.
   *
   * Tasks are not deleted with it: a task belongs to its project, and the
   * sprint is only where it was scheduled. Leaving a dangling `sprintId` would
   * hide those tasks from every sprint-scoped view with no way back.
   *
   * @param id Id of the sprint to delete.
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

  /**
   * The tasks scheduled into this sprint.
   *
   * @param sprint The sprint to read tasks from.
   * @returns Its scheduled tasks.
   */
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
   *
   * @param sprintId Id of the sprint being scheduled.
   * @param taskIds Ids of the tasks that should end up in the sprint.
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
   *
   * @param sprint The sprint to measure.
   * @returns Total committed story points.
   */
  static getTotalCommittedPoints(sprint: SprintInterface): number {
    return SprintService.getTasks(sprint).reduce((total, task) => total + task.storyPoints, 0);
  }

  /**
   * Story points delivered so far — the diagram's `getTotalCompletedPoints()`.
   * Derived rather than stored, so it cannot go stale when a task changes
   * status.
   *
   * @param sprint The sprint to measure.
   * @returns Total completed story points.
   */
  static getTotalCompletedPoints(sprint: SprintInterface): number {
    return SprintService.getTasks(sprint)
      .filter((task) => task.status === 'done')
      .reduce((total, task) => total + task.storyPoints, 0);
  }

  /**
   * Delivered points as a share of what was scheduled.
   *
   * A sprint with no tasks reports 0 rather than 100: nothing was delivered,
   * and dividing by zero would claim otherwise.
   *
   * @param sprint The sprint to measure.
   * @returns Completion percentage, 0 to 100.
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
   *
   * @param projectId Id of the project to compute velocity for.
   * @returns Average completed points per finished sprint, 0 when there are none.
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
   *
   * @param sprint The sprint to measure.
   * @returns Days remaining until `endDate`.
   */
  static getRemainingDays(sprint: SprintInterface): number {
    return Math.max(0, daysBetween(startOfToday(), sprint.endDate));
  }
}
