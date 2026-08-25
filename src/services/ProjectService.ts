import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';
import type { UpdateProjectDTO } from '@/dtos/UpdateProjectDTO';
import type { ProjectInterface, ProjectStatus } from '@/interfaces/ProjectInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { useProjectStore } from '@/stores/projectstore';
import { useTaskStore } from '@/stores/taskstore';
import { useUserStore } from '@/stores/userstore';

export class ProjectService {
  /**
   * Projects the given user belongs to. Membership is the visibility rule:
   * a project the user is not a member of never reaches their screen.
   */
  static getAllUserProjects(userId: string): ProjectInterface[] {
    return useProjectStore().projects.filter((project) => project.memberIds.includes(userId));
  }

  /** The user's projects, narrowed by status. Pass 'all' to skip filtering. */
  static getUserProjectsByStatus(
    userId: string,
    status: ProjectStatus | 'all',
  ): ProjectInterface[] {
    const projects = ProjectService.getAllUserProjects(userId);
    if (status === 'all') return projects;

    return projects.filter((project) => project.status === status);
  }

  static getById(id: string): ProjectInterface | undefined {
    return useProjectStore().projects.find((project) => project.id === id);
  }

  /**
   * Creates a project owned by the current session's user, who becomes its
   * first member. Without that the creator could not see what they just made,
   * since getAllUserProjects filters on membership.
   */
  static create(data: CreateProjectDTO): ProjectInterface {
    const creator = AuthService.getCurrentUser();
    const project: ProjectInterface = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      memberIds: creator ? [creator.id] : [],
      ...data,
    };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useProjectStore().projects.push(project);
    return project;
  }

  /** Applies a partial update. No-op when the id does not exist. */
  static update(id: string, changes: UpdateProjectDTO): void {
    const project = ProjectService.getById(id);
    if (!project) return;

    Object.assign(project, changes);
  }

  /**
   * Deletes a project and every task that belongs to it.
   *
   * The cascade is not optional: a task's project is the only way it reaches a
   * screen, so a task left behind would be invisible forever while still
   * taking up room in LocalStorage. The task store is read here rather than
   * through TaskService, which already depends on this class — going the other
   * way too would make the two services import each other.
   *
   * @param id Id of the project to delete.
   */
  static remove(id: string): void {
    const tasks = useTaskStore().tasks;
    for (let index = tasks.length - 1; index >= 0; index -= 1) {
      if (tasks[index]?.projectId === id) {
        tasks.splice(index, 1);
      }
    }

    const projects = useProjectStore().projects;
    const index = projects.findIndex((project) => project.id === id);
    if (index !== -1) {
      projects.splice(index, 1);
    }
  }

  /** Resolves the project's members from the stored memberIds. */
  static getMembers(project: ProjectInterface): UserInterface[] {
    const users = useUserStore().users;
    return project.memberIds
      .map((memberId) => users.find((user) => user.id === memberId))
      .filter((user): user is UserInterface => user !== undefined);
  }

  /** Users who are not members yet — the options for the "add member" picker. */
  static getNonMembers(project: ProjectInterface): UserInterface[] {
    return useUserStore().users.filter((user) => !project.memberIds.includes(user.id));
  }

  /** Adds a user to the project. Ignores unknown users and repeat additions. */
  static addMember(projectId: string, userId: string): void {
    const project = ProjectService.getById(projectId);
    if (!project || project.memberIds.includes(userId)) return;

    const userExists = useUserStore().users.some((user) => user.id === userId);
    if (!userExists) return;

    project.memberIds.push(userId);
  }

  /** True when the user belongs to the project. */
  static isMember(project: ProjectInterface, userId: string): boolean {
    return project.memberIds.includes(userId);
  }

  /**
   * Removes a user from the project.
   *
   * You cannot remove yourself: leaving a project you administer is done by
   * deleting it. That is also what keeps a project reachable — only admins can
   * open this screen, and only over projects they belong to, so refusing
   * self-removal guarantees at least one admin member always remains.
   */
  static removeMember(projectId: string, userId: string): void {
    const project = ProjectService.getById(projectId);
    if (!project) return;

    if (userId === AuthService.getCurrentUser()?.id) return;

    const index = project.memberIds.indexOf(userId);
    if (index !== -1) {
      project.memberIds.splice(index, 1);
    }
  }

  /**
   * Percentage of the project's tasks that are done.
   *
   * A project with no tasks reports 0 rather than 100: nothing has been
   * delivered yet, and dividing by zero would say otherwise. Rounded to a
   * whole number, since that is the only precision the progress bar shows.
   *
   * @param project The project to measure.
   * @returns Completion from 0 to 100.
   */
  static getOverallProgress(project: ProjectInterface): number {
    const tasks = useTaskStore().tasks.filter((task) => task.projectId === project.id);
    if (!tasks.length) return 0;

    const done = tasks.filter((task) => task.status === 'done').length;

    return Math.round((done / tasks.length) * 100);
  }
}
