// Author: Mateo Garcia Carreno

// internal imports
import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';
import type { UpdateProjectDTO } from '@/dtos/UpdateProjectDTO';
import type { ProjectInterface, ProjectStatus } from '@/interfaces/ProjectInterface';
import type { TaskInterface, TaskStatus } from '@/interfaces/TaskInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';
import { UserService } from '@/services/UserService';
import { useProjectStore } from '@/stores/projectstore';
import { isPastDate } from '@/utils/date';
import { nextId } from '@/utils/id';

export class ProjectService {
  static getAllUserProjects(userId: number): ProjectInterface[] {
    return useProjectStore().projects.filter((project) => project.userIds.includes(userId));
  }

  static getUserProjectsByStatus(
    userId: number,
    status: ProjectStatus | 'all',
  ): ProjectInterface[] {
    const projects = ProjectService.getAllUserProjects(userId);
    if (status === 'all') return projects;

    return projects.filter((project) => project.status === status);
  }

  static getById(id: number): ProjectInterface | undefined {
    return useProjectStore().projects.find((project) => project.id === id);
  }

  static create(CreateProjectDTO: CreateProjectDTO): ProjectInterface {
    const creator = AuthService.getCurrentUser();
    const project: ProjectInterface = {
      id: nextId(useProjectStore().projects),
      createdAt: new Date().toISOString(),
      userIds: creator ? [creator.id] : [],
      ...CreateProjectDTO,
    };

    // Mutating in place keeps PiniaConfig's deep watcher cheap.
    useProjectStore().projects.push(project);
    return project;
  }

  static update(id: number, changes: UpdateProjectDTO): void {
    const project = ProjectService.getById(id);
    if (!project) return;

    Object.assign(project, changes);
  }

  static remove(id: number): void {
    // Tasks go first, so unscheduling them is a no-op by the time the sprints
    // are removed. Each entity is deleted by the service that owns its store.
    TaskService.removeByProject(id);
    SprintService.removeByProject(id);

    const projects = useProjectStore().projects;
    const index = projects.findIndex((project) => project.id === id);
    if (index !== -1) {
      projects.splice(index, 1);
    }
  }

  static getUsers(project: ProjectInterface): UserInterface[] {
    return project.userIds
      .map((userId) => UserService.getById(userId))
      .filter((user): user is UserInterface => user !== undefined);
  }

  static getAvailableUsers(project: ProjectInterface): UserInterface[] {
    return UserService.getAll().filter((user) => !project.userIds.includes(user.id));
  }

  static addUser(projectId: number, userId: number): void {
    const project = ProjectService.getById(projectId);
    if (!project || project.userIds.includes(userId)) return;

    if (!UserService.getById(userId)) return;

    project.userIds.push(userId);
  }

  static removeUserEverywhere(userId: number): void {
    // Ids are reused once the highest is freed, so a leftover id would put
    // the next user created onto projects they were never added to.
    useProjectStore().projects.forEach((project) => {
      const index = project.userIds.indexOf(userId);
      if (index !== -1) {
        project.userIds.splice(index, 1);
      }
    });
  }

  static hasUser(project: ProjectInterface, userId: number): boolean {
    return project.userIds.includes(userId);
  }

  static removeUser(projectId: number, userId: number): void {
    const project = ProjectService.getById(projectId);
    if (!project) return;

    // Refusing self-removal is what guarantees at least one admin user
    // remains: to leave a project you administer, delete it.
    if (userId === AuthService.getCurrentUser()?.id) return;

    const index = project.userIds.indexOf(userId);
    if (index !== -1) {
      project.userIds.splice(index, 1);
    }
  }

  static getProgress(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all' = 'all',
  ): number {
    const tasks = TaskService.getProjectTasksFiltered(projectId, sprintId, status);
    if (!tasks.length) return 0;

    const done = tasks.filter((task) => task.status === 'done').length;

    return Math.round((done / tasks.length) * 100);
  }

  static getCompletedTaskCount(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all' = 'all',
  ): number {
    return TaskService.getProjectTasksFiltered(projectId, sprintId, status).filter(
      (task) => task.status === 'done',
    ).length;
  }

  static getTotalTaskCount(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all' = 'all',
  ): number {
    return TaskService.getProjectTasksFiltered(projectId, sprintId, status).length;
  }

  static getActiveSprintCount(projectId: number): number {
    return SprintService.getActiveSprints(projectId).length;
  }

  static getOverdueTaskCount(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all' = 'all',
  ): number {
    return TaskService.getProjectTasksFiltered(projectId, sprintId, status).filter(
      (task) => task.status !== 'done' && task.dueDate !== null && isPastDate(task.dueDate),
    ).length;
  }

  static getTasksByStatus(
    projectId: number,
    sprintId: number | null,
  ): { labels: TaskStatus[]; values: number[] } {
    const tasks = TaskService.getProjectTasksFiltered(projectId, sprintId);
    const order: TaskStatus[] = ['todo', 'in_progress', 'done'];

    return {
      labels: order,
      values: order.map((status) => tasks.filter((task) => task.status === status).length),
    };
  }

  static getTasksByProject(userId: number): { labels: string[]; values: number[] } {
    const projects = ProjectService.getAllUserProjects(userId);

    return {
      labels: projects.map((project) => project.name),
      values: projects.map((project) => TaskService.getByProject(project.id).length),
    };
  }

  static getWorkloadByAssignee(
    projectId: number,
    sprintId: number | null,
    status: TaskStatus | 'all' = 'all',
  ): { labels: string[]; values: number[] } {
    const project = ProjectService.getById(projectId);
    if (!project) return { labels: [], values: [] };

    const open = TaskService.getProjectTasksFiltered(projectId, sprintId, status).filter(
      (task) => task.status !== 'done',
    );

    // Users with nothing open still get a row: an idle user is exactly
    // what this chart should reveal.
    const rows = ProjectService.getUsers(project).map((user) => ({
      label: user.name,
      value: open.filter((task) => task.assigneeId === user.id).length,
    }));

    const unassigned = open.filter((task) => task.assigneeId === null).length;
    if (unassigned > 0) {
      rows.push({ label: 'Unassigned', value: unassigned });
    }

    rows.sort((a, b) => b.value - a.value);

    return { labels: rows.map((row) => row.label), values: rows.map((row) => row.value) };
  }

  static getUserTasks(
    projectId: number,
    sprintId: number | null,
    userId: number,
    status: TaskStatus | 'all' = 'all',
  ): TaskInterface[] {
    const farFuture = '9999-12-31';

    return (
      TaskService.getProjectTasksFiltered(projectId, sprintId, status)
        .filter((task) => task.assigneeId === userId)
        // Unfinished first, nearest deadline first within that, so the top of
        // the table is what to do next. Tasks with no due date sort last.
        .sort((a, b) => {
          const aDone = a.status === 'done' ? 1 : 0;
          const bDone = b.status === 'done' ? 1 : 0;
          if (aDone !== bDone) return aDone - bDone;

          return (a.dueDate ?? farFuture).localeCompare(b.dueDate ?? farFuture);
        })
    );
  }
}
