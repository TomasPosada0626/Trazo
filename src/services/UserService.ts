import type { CreateUserDTO } from '@/dtos/CreateUserDTO';
import type { UpdateUserDTO } from '@/dtos/UpdateUserDTO';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { useUserStore } from '@/stores/userstore';

export class UserService {
  /** Returns every registered user. */
  static getAll(): UserInterface[] {
    return useUserStore().users;
  }

  /** Finds a user by id, or returns `undefined` when it does not exist. */
  static getById(id: string): UserInterface | undefined {
    return useUserStore().users.find((user) => user.id === id);
  }

  /** Creates and stores a user with a generated id. */
  static create(data: CreateUserDTO): UserInterface {
    const user: UserInterface = { id: crypto.randomUUID(), ...data };
    useUserStore().users.push(user);
    return user;
  }

  /** Applies a partial update. No-op when the id does not exist. */
  static update(id: string, changes: UpdateUserDTO): void {
    const user = UserService.getById(id);
    if (!user) return;

    Object.assign(user, changes);
  }

  /** Removes a user unless they are the account currently in session. */
  static remove(id: string): boolean {
    if (id === AuthService.getCurrentUser()?.id) return false;

    const users = useUserStore().users;
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
  }

  /** Returns the number of active projects that include the user. */
  static getActiveProjects(user: UserInterface): number {
    return ProjectService.getAllUserProjects(user.id).filter(
      (project) => project.status === 'active',
    ).length;
  }
}