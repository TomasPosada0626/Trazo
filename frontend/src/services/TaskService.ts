// Author: Hever-Alfonso

// internal imports
import type { CreateTaskDTO } from '@/dtos/CreateTaskDTO';
import type { UpdateTaskDTO } from '@/dtos/UpdateTaskDTO';
import type { TaskInterface, TaskStatus } from '@/interfaces/TaskInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { ProjectService } from '@/services/ProjectService';
import { UserService } from '@/services/UserService';
import { useTaskStore } from '@/stores/taskstore';
import { IdUtils } from '@/utils/IdUtils';

export class TaskService {
  static getByProject(projectId: number): TaskInterface[] {
    return useTaskStore().tasks.filter((task) => task.projectId === projectId);
  }

  static getProjectTasksFiltered(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all' = 'all',
  ): TaskInterface[] {
    return TaskService.getByProject(projectId).filter(
      (task) =>
        (!sprintId || task.sprintId === sprintId) && (status === 'all' || task.status === status),
    );
  }

  static getAllUserTasks(userId: number): TaskInterface[] {
    const projectIds = ProjectService.getAllUserProjects(userId).map((project) => project.id);

    return useTaskStore().tasks.filter((task) => projectIds.includes(task.projectId));
  }

  static getUserTasksFiltered(
    userId: number,
    projectId: number | 'all',
    status: TaskStatus | 'all',
  ): TaskInterface[] {
    return TaskService.getAllUserTasks(userId).filter(
      (task) =>
        (projectId === 'all' || task.projectId === projectId) &&
        (status === 'all' || task.status === status),
    );
  }

  static getById(id: number): TaskInterface | undefined {
    return useTaskStore().tasks.find((task) => task.id === id);
  }

  static create(data: CreateTaskDTO): TaskInterface {
    TaskService.assertValid(data.title, data.projectId, data.assigneeId);

    const task: TaskInterface = {
      id: IdUtils.nextId(useTaskStore().tasks),
      createdAt: new Date().toISOString(),
      sprintId: null,
      ...data,
      title: data.title.trim(),
    };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useTaskStore().tasks.push(task);
    return task;
  }

  static update(id: number, changes: UpdateTaskDTO): void {
    const task = TaskService.getById(id);
    if (!task) return;

    // Validate the task as it will look once merged, so a change to one field
    // is checked against the fields it depends on rather than in isolation.
    const merged = { ...task, ...changes };
    TaskService.assertValid(merged.title, merged.projectId, merged.assigneeId);

    Object.assign(task, changes, { title: merged.title.trim() });
  }

  static getBySprint(sprintId: number): TaskInterface[] {
    return useTaskStore().tasks.filter((task) => task.sprintId === sprintId);
  }

  static getByAssignee(userId: number): TaskInterface[] {
    return useTaskStore().tasks.filter((task) => task.assigneeId === userId);
  }

  static setSprint(taskId: number, sprintId: number | null): void {
    const task = TaskService.getById(taskId);
    if (!task) return;

    task.sprintId = sprintId;
  }

  static unassignUser(userId: number): void {
    // Ids are reused once the highest is freed, so a stale assigneeId would
    // hand the old user's work to whoever is created next.
    TaskService.getByAssignee(userId).forEach((task) => {
      task.assigneeId = null;
    });
  }

  static removeByProject(projectId: number): void {
    const tasks = useTaskStore().tasks;
    for (let index = tasks.length - 1; index >= 0; index -= 1) {
      if (tasks[index]?.projectId === projectId) {
        tasks.splice(index, 1);
      }
    }
  }

  static remove(id: number): void {
    const tasks = useTaskStore().tasks;
    const index = tasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
    }
  }

  static updateStatus(task: TaskInterface, status: TaskStatus): void {
    task.status = status;
  }

  static assignTo(task: TaskInterface, user: UserInterface | null): void {
    TaskService.assertValid(task.title, task.projectId, user?.id ?? null);

    task.assigneeId = user?.id ?? null;
  }

  static getAssignableUsers(projectId: number): UserInterface[] {
    const project = ProjectService.getById(projectId);

    return project ? ProjectService.getUsers(project) : [];
  }

  static getAssignee(task: TaskInterface): UserInterface | undefined {
    if (!task.assigneeId) return undefined;

    return UserService.getById(task.assigneeId);
  }

  private static assertValid(title: string, projectId: number, assigneeId: number | null): void {
    if (!title.trim()) {
      throw new Error('The task title is required.');
    }

    const project = ProjectService.getById(projectId);
    if (!project) {
      throw new Error('The selected project does not exist.');
    }

    if (assigneeId && !ProjectService.hasUser(project, assigneeId)) {
      throw new Error('The assignee must be a user of the project.');
    }
  }
}
