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
import { IdUtils } from '@/utils/IdUtils';

export class UserService {
  static getAll(): UserInterface[] {
    return useUserStore().users;
  }

  static getById(id: number): UserInterface | undefined {
    return useUserStore().users.find((user) => user.id === id);
  }

  static create(CreateUserDTO: CreateUserDTO): UserInterface {
    const user: UserInterface = { id: IdUtils.nextId(useUserStore().users), ...CreateUserDTO };
    useUserStore().users.push(user);
    return user;
  }

  static update(id: number, changes: UpdateUserDTO): void {
    const user = UserService.getById(id);
    if (!user) return;

    Object.assign(user, changes);
  }

  static remove(id: number): boolean {
    if (id === AuthService.getCurrentUser()?.id) return false;

    const users = useUserStore().users;
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return false;

    // Drop every reference before the id can be handed to someone else.
    TaskService.unassignUser(id);
    ProjectService.removeUserEverywhere(id);

    users.splice(index, 1);
    return true;
  }

  static getActiveProjects(user: UserInterface): number {
    return ProjectService.getAllUserProjects(user.id).filter(
      (project) => project.status === 'active',
    ).length;
  }

  static getAssignedTasks(user: UserInterface): TaskInterface[] {
    // No project filter is needed: a task can only be assigned to a user
    // of its own project, so everything here is already visible to them.
    return TaskService.getByAssignee(user.id);
  }
}
