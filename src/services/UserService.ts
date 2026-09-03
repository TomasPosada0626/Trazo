// Author: Tomás Posada

// internal imports
import type { CreateUserDTO } from '@/dtos/CreateUserDTO';
import type { UpdateUserDTO } from '@/dtos/UpdateUserDTO';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';
import { useUserStore } from '@/stores/userstore';
import { nextId } from '@/utils/id';

export class UserService {
  /** @returns Every registered user. */
  static getAll(): UserInterface[] {
    return useUserStore().users;
  }

  /**
   * Finds a user by id.
   *
   * @param id Id of the user.
   * @returns The user, or `undefined` when no user carries that id.
   */
  static getById(id: number): UserInterface | undefined {
    return useUserStore().users.find((user) => user.id === id);
  }

  /**
   * Creates and stores a user with a generated id.
   *
   * @param data User fields supplied by the form.
   * @returns The stored user.
   */
  static create(data: CreateUserDTO): UserInterface {
    const user: UserInterface = { id: nextId(useUserStore().users), ...data };
    useUserStore().users.push(user);
    return user;
  }

  /**
   * Applies a partial update. No-op when the id does not exist.
   *
   * @param id Id of the user to update.
   * @param changes Fields to overwrite; omitted fields keep their value.
   */
  static update(id: number, changes: UpdateUserDTO): void {
    const user = UserService.getById(id);
    if (!user) return;

    Object.assign(user, changes);
  }

  /**
   * Removes a user unless they are the account currently in session.
   *
   * @param id Id of the user to remove.
   * @returns `true` when the user was removed, `false` when it doesn't exist
   * or is the signed-in account.
   */
  static remove(id: number): boolean {
    if (id === AuthService.getCurrentUser()?.id) return false;

    const users = useUserStore().users;
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return false;

    // Drop every reference before the id can be handed to someone else.
    TaskService.unassignUser(id);
    ProjectService.removeMemberEverywhere(id);

    users.splice(index, 1);
    return true;
  }

  /**
   * Counts the user's active projects.
   *
   * @param user The user to count projects for.
   * @returns Number of active projects that include the user.
   */
  static getActiveProjects(user: UserInterface): number {
    return ProjectService.getAllUserProjects(user.id).filter(
      (project) => project.status === 'active',
    ).length;
  }

  /**
   * Tasks currently assigned to the user. Implements User.getAssignedTasks()
   * from the class diagram, which the interface cannot hold as a method.
   *
   * No membership filter is needed: a task can only be assigned to a member of
   * its own project, so everything returned here is already visible to them.
   *
   * @param user The user whose workload is being listed.
   * @returns The tasks assigned to that user, across every project.
   */
  static getAssignedTasks(user: UserInterface): TaskInterface[] {
    return TaskService.getByAssignee(user.id);
  }
}
