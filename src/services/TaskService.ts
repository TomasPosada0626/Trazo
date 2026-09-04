// Author: Hever-Alfonso

// internal imports
import type { CreateTaskDTO } from '@/dtos/CreateTaskDTO';
import type { UpdateTaskDTO } from '@/dtos/UpdateTaskDTO';
import type { TaskInterface, TaskStatus } from '@/interfaces/TaskInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { ProjectService } from '@/services/ProjectService';
import { UserService } from '@/services/UserService';
import { useTaskStore } from '@/stores/taskstore';
import { nextId } from '@/utils/id';

export class TaskService {
  /**
   * Tasks belonging to the given project.
   *
   * @param projectId Id of the owning project.
   * @returns The project's tasks, empty when it has none or does not exist.
   */
  static getByProject(projectId: number): TaskInterface[] {
    return useTaskStore().tasks.filter((task) => task.projectId === projectId);
  }

  /**
   * Every task the user is allowed to see.
   *
   * Visibility follows the same rule as projects: a task belongs to a project,
   * and a project the user is not a member of never reaches their screen. The
   * tasks route is open to members too, so this cannot rely on the admin guard.
   *
   * @param userId Id of the user whose tasks are being listed.
   * @returns Tasks across every project the user belongs to.
   */
  static getAllUserTasks(userId: number): TaskInterface[] {
    const projectIds = ProjectService.getAllUserProjects(userId).map((project) => project.id);

    return useTaskStore().tasks.filter((task) => projectIds.includes(task.projectId));
  }

  /**
   * The user's tasks, narrowed by project and status.
   *
   * @param userId Id of the user whose tasks are being listed.
   * @param projectId Id of a project to restrict to, or 'all' to skip.
   * @param status Status to restrict to, or 'all' to skip.
   * @returns The matching tasks, in store order.
   */
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

  /**
   * Finds a task by id.
   *
   * @param id Id of the task.
   * @returns The task, or `undefined` when no task carries that id.
   */
  static getById(id: number): TaskInterface | undefined {
    return useTaskStore().tasks.find((task) => task.id === id);
  }

  /**
   * Creates and stores a task with a generated id and creation date.
   *
   * @param data Task fields supplied by the form.
   * @returns The stored task.
   * @throws {Error} When the title is blank, the project does not exist, or
   * the assignee is not a member of that project.
   */
  static create(data: CreateTaskDTO): TaskInterface {
    TaskService.assertValid(data.title, data.projectId, data.assigneeId);

    const task: TaskInterface = {
      id: nextId(useTaskStore().tasks),
      createdAt: new Date().toISOString(),
      ...data,
      title: data.title.trim(),
    };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useTaskStore().tasks.push(task);
    return task;
  }

  /**
   * Applies a partial update. No-op when the id does not exist.
   *
   * @param id Id of the task to update.
   * @param changes Fields to overwrite; omitted fields keep their value.
   * @throws {Error} When a supplied field fails the same checks as create().
   */
  static update(id: number, changes: UpdateTaskDTO): void {
    const task = TaskService.getById(id);
    if (!task) return;

    // Validate the task as it will look once merged, so a change to one field
    // is checked against the fields it depends on rather than in isolation.
    const merged = { ...task, ...changes };
    TaskService.assertValid(merged.title, merged.projectId, merged.assigneeId);

    Object.assign(task, changes, { title: merged.title.trim() });
  }

  /**
   * Tasks scheduled into the given sprint.
   *
   * @param sprintId Id of the sprint.
   * @returns Its tasks, empty when nothing is scheduled into it.
   */
  static getBySprint(sprintId: number): TaskInterface[] {
    return useTaskStore().tasks.filter((task) => task.sprintId === sprintId);
  }

  /**
   * Tasks assigned to the given user, across every project.
   *
   * @param userId Id of the assignee.
   * @returns Their tasks, empty when they have none.
   */
  static getByAssignee(userId: number): TaskInterface[] {
    return useTaskStore().tasks.filter((task) => task.assigneeId === userId);
  }

  /**
   * Schedules a task into a sprint, or returns it to the backlog with `null`.
   *
   * `sprintId` is a field of the task, so this class owns the write even when
   * the change is driven from the sprint side. SprintService calls this rather
   * than editing tasks itself.
   *
   * @param taskId Id of the task to move.
   * @param sprintId Sprint to schedule it into, or null for the backlog.
   */
  static setSprint(taskId: number, sprintId: number | null): void {
    const task = TaskService.getById(taskId);
    if (!task) return;

    task.sprintId = sprintId;
  }

  /**
   * Clears the assignee on every task held by the given user.
   *
   * Called when a user is deleted. Ids are reused once the highest is freed,
   * so a stale `assigneeId` would silently attach the old user's work to
   * whoever is created next.
   *
   * @param userId Id of the user being removed.
   */
  static unassignUser(userId: number): void {
    TaskService.getByAssignee(userId).forEach((task) => {
      task.assigneeId = null;
    });
  }

  /**
   * Deletes every task of a project, for the cascade in ProjectService.remove.
   *
   * @param projectId Id of the project being deleted.
   */
  static removeByProject(projectId: number): void {
    const tasks = useTaskStore().tasks;
    for (let index = tasks.length - 1; index >= 0; index -= 1) {
      if (tasks[index]?.projectId === projectId) {
        tasks.splice(index, 1);
      }
    }
  }

  /**
   * Removes a task from the store.
   *
   * @param id Id of the task to remove.
   */
  static remove(id: number): void {
    const tasks = useTaskStore().tasks;
    const index = tasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
    }
  }

  /**
   * Moves a task to another status. Implements Task.updateStatus() from the
   * class diagram, which the interface cannot hold as a method of its own.
   *
   * @param task The task to move.
   * @param status The status to move it to.
   */
  static updateStatus(task: TaskInterface, status: TaskStatus): void {
    task.status = status;
  }

  /**
   * Assigns a task to a user, or clears the assignee when given `null`.
   * Implements Task.assignTo() from the class diagram.
   *
   * @param task The task to assign.
   * @param user The user taking it, or `null` to leave it unassigned.
   * @throws {Error} When the user does not belong to the task's project.
   */
  static assignTo(task: TaskInterface, user: UserInterface | null): void {
    TaskService.assertValid(task.title, task.projectId, user?.id ?? null);

    task.assigneeId = user?.id ?? null;
  }

  /**
   * Users a task in this project may be assigned to.
   *
   * The pool is the project's own member roster: assigning a task to somebody
   * outside the project would make it invisible to them, since tasks are only
   * reachable through the projects a user belongs to.
   *
   * @param projectId Id of the project the task belongs to.
   * @returns The project's members, empty when the project does not exist.
   */
  static getAssignableUsers(projectId: number): UserInterface[] {
    const project = ProjectService.getById(projectId);

    return project ? ProjectService.getMembers(project) : [];
  }

  /**
   * Resolves the task's assignee from the stored assigneeId.
   *
   * @param task The task to resolve.
   * @returns The assigned user, or `undefined` when nobody has picked it up.
   */
  static getAssignee(task: TaskInterface): UserInterface | undefined {
    if (!task.assigneeId) return undefined;

    return UserService.getById(task.assigneeId);
  }

  /**
   * Guards the invariants every stored task has to satisfy. Kept in one place
   * so create(), update() and assignTo() cannot drift apart.
   *
   * @param title Title the task will carry.
   * @param projectId Id of the project the task will belong to.
   * @param assigneeId Id of the assignee, or `null` when unassigned.
   * @throws {Error} When any of the three is invalid.
   */
  private static assertValid(title: string, projectId: number, assigneeId: number | null): void {
    if (!title.trim()) {
      throw new Error('The task title is required.');
    }

    const project = ProjectService.getById(projectId);
    if (!project) {
      throw new Error('The selected project does not exist.');
    }

    if (assigneeId && !ProjectService.isMember(project, assigneeId)) {
      throw new Error('The assignee must be a member of the project.');
    }
  }
}
