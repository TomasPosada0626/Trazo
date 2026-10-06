// Author: Mateo Garcia Carreno

// external imports
import { BadRequestException, Injectable } from '@nestjs/common';

// internal imports
import { DateUtils } from '../common/date.utils.js';
import { Project } from '../projects/entities/project.entity.js';
import { ProjectsService } from '../projects/projects.service.js';
import { SprintsService } from '../sprints/sprints.service.js';
import {
  Task,
  TASK_STATUSES,
  type TaskStatus,
} from '../tasks/entities/task.entity.js';
import { TasksService } from '../tasks/tasks.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class DashboardService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly sprintsService: SprintsService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  async getDashboard(
    projectId: number,
    sprintId: number | undefined,
    status: string | undefined,
    currentUserId: number,
  ): Promise<{
    progress: number;
    activeSprints: number;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    tasksByStatus: { labels: TaskStatus[]; values: number[] };
    tasksByProject: { labels: string[]; values: number[] };
    velocity: { sprintIds: number[]; committed: number[]; completed: number[] };
    workload: { name: string | null; openTasks: number }[] | null;
    userTasks: Task[];
  }> {
    // A query string arrives untyped, so the status filter is checked here
    // rather than trusted; an unknown value would otherwise match no task.
    if (status !== undefined && !TASK_STATUSES.some((s) => s === status)) {
      throw new BadRequestException(
        `status must be one of: ${TASK_STATUSES.join(', ')}.`,
      );
    }

    const project = await this.projectsService.findOneForUser(
      projectId,
      currentUserId,
    );
    if (sprintId !== undefined) {
      const sprint = await this.sprintsService.findOne(sprintId);
      if (sprint.projectId !== projectId) {
        throw new BadRequestException(
          'The sprint does not belong to the project.',
        );
      }
    }
    const currentUser = await this.usersService.findOne(currentUserId);

    // The range picker narrows the project to one sprint, and the status
    // filter narrows that further. The status chart and the velocity chart
    // read the unfiltered sets, since a filter would leave them one bar wide.
    const projectTasks = await this.tasksService.findByProjects([projectId]);
    const inRange =
      sprintId === undefined
        ? projectTasks
        : projectTasks.filter((task) => task.sprintId === sprintId);
    const filtered =
      status === undefined
        ? inRange
        : inRange.filter((task) => task.status === status);
    const done = filtered.filter((task) => task.status === 'done').length;

    return {
      progress: filtered.length
        ? Math.round((done / filtered.length) * 100)
        : 0,
      activeSprints: await this.sprintsService.countActive(projectId),
      completedTasks: done,
      totalTasks: filtered.length,
      overdueTasks: filtered.filter(
        (task) =>
          task.status !== 'done' &&
          task.dueDate !== null &&
          DateUtils.isPastDate(task.dueDate),
      ).length,
      tasksByStatus: {
        labels: [...TASK_STATUSES],
        values: TASK_STATUSES.map(
          (taskStatus) =>
            inRange.filter((task) => task.status === taskStatus).length,
        ),
      },
      tasksByProject: await this.getTasksByProject(currentUserId),
      velocity: await this.sprintsService.getVelocitySeries(projectId),
      // Ranking the team against each other is a question for whoever staffs
      // the project, so members get null instead of their colleagues' load.
      workload:
        currentUser.role === 'admin'
          ? await this.getWorkload(project, filtered)
          : null,
      userTasks: this.getUserTasks(filtered, currentUserId),
    };
  }

  private async getTasksByProject(
    userId: number,
  ): Promise<{ labels: string[]; values: number[] }> {
    const projects = await this.projectsService.findAllForUser(userId);
    const tasks = await this.tasksService.findByProjects(
      projects.map((project) => project.id),
    );

    return {
      labels: projects.map((project) => project.name),
      values: projects.map(
        (project) =>
          tasks.filter((task) => task.projectId === project.id).length,
      ),
    };
  }

  private async getWorkload(
    project: Project,
    tasks: Task[],
  ): Promise<{ name: string | null; openTasks: number }[]> {
    const open = tasks.filter((task) => task.status !== 'done');
    const users = await this.usersService.findByIds(project.userIds);

    // Users with nothing open still get a row: an idle user is exactly what
    // this chart should reveal. A null name is the unassigned bucket, which
    // the frontend labels.
    const rows: { name: string | null; openTasks: number }[] = users.map(
      (user) => ({
        name: user.name,
        openTasks: open.filter((task) => task.assigneeId === user.id).length,
      }),
    );

    const unassigned = open.filter((task) => task.assigneeId === null).length;
    if (unassigned > 0) {
      rows.push({ name: null, openTasks: unassigned });
    }

    return rows.sort((a, b) => b.openTasks - a.openTasks);
  }

  private getUserTasks(tasks: Task[], userId: number): Task[] {
    const farFuture = '9999-12-31';

    // Unfinished first, nearest deadline first within that, so the top of the
    // table is what to do next. Tasks with no due date sort last.
    return tasks
      .filter((task) => task.assigneeId === userId)
      .sort((a, b) => {
        const aDone = a.status === 'done' ? 1 : 0;
        const bDone = b.status === 'done' ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;

        return (a.dueDate ?? farFuture).localeCompare(b.dueDate ?? farFuture);
      });
  }
}
