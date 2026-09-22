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
import { nextId, shortId } from '@/utils/id';

export class SprintService {
  static getByProject(projectId: number): SprintInterface[] {
    return useSprintStore().sprints.filter((sprint) => sprint.projectId === projectId);
  }

  static getById(id: number): SprintInterface | undefined {
    return useSprintStore().sprints.find((sprint) => sprint.id === id);
  }

  static getActiveSprints(projectId: number): SprintInterface[] {
    return SprintService.getByProject(projectId).filter((sprint) => sprint.status === 'active');
  }

  static create({ taskIds, ...data }: CreateSprintDTO): SprintInterface {
    SprintService.assertValid(data.name, data.projectId);

    const sprint: SprintInterface = { id: nextId(useSprintStore().sprints), ...data };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useSprintStore().sprints.push(sprint);

    // The sprint has to exist before a task can point at it.
    SprintService.setTasks(sprint.id, taskIds);
    return sprint;
  }

  static update(id: number, { taskIds, ...changes }: UpdateSprintDTO): void {
    const sprint = SprintService.getById(id);
    if (!sprint) return;

    if (changes.name !== undefined) {
      SprintService.assertValid(changes.name, changes.projectId ?? sprint.projectId, id);
    }

    Object.assign(sprint, changes);

    // An empty array is an instruction, not an absence: it clears the sprint.
    if (taskIds !== undefined) SprintService.setTasks(id, taskIds);
  }

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

  static remove(id: number): void {
    const sprints = useSprintStore().sprints;
    const index = sprints.findIndex((sprint) => sprint.id === id);
    if (index === -1) return;

    // Tasks are not deleted with the sprint: a task belongs to its project, so
    // a dangling sprintId would hide it from every sprint-scoped view.
    TaskService.getBySprint(id).forEach((task) => TaskService.setSprint(task.id, null));

    sprints.splice(index, 1);
  }

  static removeByProject(projectId: number): void {
    // Delegating per sprint keeps the task-unscheduling in one place.
    // getByProject returns a fresh array, so splicing while iterating is safe.
    SprintService.getByProject(projectId).forEach((sprint) => SprintService.remove(sprint.id));
  }

  static getTasks(sprint: SprintInterface): TaskInterface[] {
    return TaskService.getBySprint(sprint.id);
  }

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

  static getTotalCommittedPoints(sprint: SprintInterface): number {
    return SprintService.getTasks(sprint).reduce((total, task) => total + task.storyPoints, 0);
  }

  static getTotalCompletedPoints(sprint: SprintInterface): number {
    return SprintService.getTasks(sprint)
      .filter((task) => task.status === 'done')
      .reduce((total, task) => total + task.storyPoints, 0);
  }

  static calculateCompletionPercentage(sprint: SprintInterface): number {
    const committed = SprintService.getTotalCommittedPoints(sprint);
    if (committed <= 0) return 0;

    return Math.round((SprintService.getTotalCompletedPoints(sprint) / committed) * 100);
  }

  static calculateVelocity(projectId: number): number {
    // Only completed sprints count: an in-flight sprint has not had its chance
    // to deliver, and including it would drag the average down every time.
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

  static getVelocitySeries(projectId: number): {
    labels: string[];
    values: number[];
    committed: number[];
  } {
    // Always the whole project: a velocity chart of a single sprint would be
    // one pair of bars with nothing to compare against.
    const sprints = SprintService.getByProject(projectId);

    return {
      labels: sprints.map((sprint) => shortId('SPR', sprint.id)),
      committed: sprints.map((sprint) => SprintService.getTotalCommittedPoints(sprint)),
      values: sprints.map((sprint) => SprintService.getTotalCompletedPoints(sprint)),
    };
  }

  static getRemainingDays(sprint: SprintInterface): number {
    return Math.max(0, daysBetween(startOfToday(), sprint.endDate));
  }
}
