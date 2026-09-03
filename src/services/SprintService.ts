import type { CreateSprintDTO } from '@/dtos/CreateSprintDTO';
import type { UpdateSprintDTO } from '@/dtos/UpdateSprintDTO';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { useSprintStore } from '@/stores/sprintstore';
import { useTaskStore } from '@/stores/taskstore';
import { daysBetween, startOfToday } from '@/utils/date';

export class SprintService {
  /** Every sprint of a project, in seeded order. */
  static getByProject(projectId: string): SprintInterface[] {
    return useSprintStore().sprints.filter((sprint) => sprint.projectId === projectId);
  }

  static getById(id: string): SprintInterface | undefined {
    return useSprintStore().sprints.find((sprint) => sprint.id === id);
  }

  /** Sprints currently running, i.e. `Project.getActiveSprints()` in the diagram. */
  static getActiveSprints(projectId: string): SprintInterface[] {
    return SprintService.getByProject(projectId).filter((sprint) => sprint.status === 'active');
  }

  static create(data: CreateSprintDTO): SprintInterface {
    const sprint: SprintInterface = { id: crypto.randomUUID(), ...data };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useSprintStore().sprints.push(sprint);
    return sprint;
  }

  /** Applies a partial update. No-op when the id does not exist. */
  static update(id: string, changes: UpdateSprintDTO): void {
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
  static remove(id: string): void {
    const sprints = useSprintStore().sprints;
    const index = sprints.findIndex((sprint) => sprint.id === id);
    if (index === -1) return;

    useTaskStore()
      .tasks.filter((task) => task.sprintId === id)
      .forEach((task) => {
        task.sprintId = null;
      });

    sprints.splice(index, 1);
  }

  /** The tasks scheduled into this sprint. */
  static getTasks(sprint: SprintInterface): TaskInterface[] {
    return useTaskStore().tasks.filter((task) => task.sprintId === sprint.id);
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
   * Delivered points as a share of what was committed, 0–100.
   *
   * Can exceed 100 when a team finishes more than it promised; that is real
   * information, so it is not clamped.
   */
  static calculateCompletionPercentage(sprint: SprintInterface): number {
    if (sprint.totalCommittedPoints <= 0) return 0;

    return Math.round(
      (SprintService.getTotalCompletedPoints(sprint) / sprint.totalCommittedPoints) * 100,
    );
  }

  /**
   * Average points delivered per finished sprint — the diagram's
   * `calculateVelocity()`.
   *
   * Only completed sprints count: an in-flight sprint has not had its chance
   * to deliver yet, and including it would drag the average down every time.
   */
  static calculateVelocity(projectId: string): number {
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
