import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';
import type { UpdateProjectDTO } from '@/dtos/UpdateProjectDTO';
import type { ProjectInterface, ProjectStatus } from '@/interfaces/ProjectInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { useProjectStore } from '@/stores/projectstore';
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

  static remove(id: string): void {
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
   * Returns 0 until the task slice exists: there is no task store to read yet,
   * so every project reports 0% progress. The signature is already the one the
   * class diagram calls for, so only the body changes later.
   */
  static getOverallProgress(project: ProjectInterface): number {
    void project;
    return 0;
  }
}
