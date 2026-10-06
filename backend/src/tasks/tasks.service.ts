// Developed by Mateo Garcia Carreno

// External imports
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';

// Internal imports
import { CreateTaskDto } from './dto/create-task.dto.js';
import { DateUtils } from '../common/date.utils.js';
import { Project } from '../projects/entities/project.entity.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ProjectUserRemovedEvent } from '../projects/events/project-user-removed.event.js';
import { Task } from './entities/task.entity.js';
import { TASK_STATUSES, type TaskStatus } from '../types/TasksTypes.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async findAllWithNames(userId: number, projectId?: number): Promise<Task[]> {
    const projects = await this.projectsService.findAllForUser(userId);
    const projectNames = new Map(
      projects.map((project) => [project.id, project.name]),
    );

    if (projectId !== undefined && !projectNames.has(projectId)) {
      throw new NotFoundException('The project does not exist.');
    }

    const projectIds =
      projectId === undefined ? [...projectNames.keys()] : [projectId];
    const tasks = await this.findByProjects(projectIds);

    const assigneeIds = tasks
      .map((task) => task.assigneeId)
      .filter((assigneeId) => assigneeId !== null);
    const assignees = await this.usersService.findByIds([
      ...new Set(assigneeIds),
    ]);
    const assigneeNames = new Map(
      assignees.map((user) => [user.id, user.name]),
    );

    for (const task of tasks) {
      task.projectName = projectNames.get(task.projectId) ?? '';
      task.assigneeName =
        task.assigneeId === null
          ? null
          : (assigneeNames.get(task.assigneeId) ?? null);
    }

    return tasks;
  }

  async getStats(
    currentUserId: number,
    projectId: number,
    sprintId: number | undefined,
    status: string | undefined,
  ): Promise<{
    progress: number;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    tasksByStatus: { labels: TaskStatus[]; values: number[] };
    workload: { name: string | null; openTasks: number }[] | null;
    userTasks: Task[];
  }> {
    if (status !== undefined && !TASK_STATUSES.some((s) => s === status)) {
      throw new BadRequestException(
        `status must be one of: ${TASK_STATUSES.join(', ')}.`,
      );
    }

    const project = await this.projectsService.findOneForUser(
      projectId,
      currentUserId,
    );
    const currentUser = await this.usersService.findOne(currentUserId);

    const projectTasks = await this.findByProjects([projectId]);
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
      workload:
        currentUser.role === 'admin'
          ? await this.getWorkload(project, filtered)
          : null,
      userTasks: this.getUserTasks(filtered, currentUserId),
    };
  }

  async findByProjects(projectIds: number[]): Promise<Task[]> {
    return await this.tasksRepository.find({
      where: { project: { id: In(projectIds) } },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('The task does not exist.');
    }

    return task;
  }

  async findOneForUser(id: number, userId: number): Promise<Task> {
    const task = await this.findOne(id);
    const project = await this.projectsService.findOne(task.projectId);

    if (!this.projectsService.hasUser(project, userId)) {
      throw new NotFoundException('The task does not exist.');
    }

    return task;
  }

  async create(
    createTaskDto: CreateTaskDto,
    currentUserId: number,
  ): Promise<Task> {
    const { projectId, assigneeId = null, ...fields } = createTaskDto;
    const project = await this.projectsService.findOneForUser(
      projectId,
      currentUserId,
    );
    this.assertAssignable(project, assigneeId);

    const task = this.tasksRepository.create({
      ...fields,
      project: { id: projectId },
      sprint: null,
      assignee: assigneeId === null ? null : { id: assigneeId },
    });
    const saved = await this.tasksRepository.save(task);

    return await this.findOne(saved.id);
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    currentUserId: number,
  ): Promise<Task> {
    const task = await this.findOneForUser(id, currentUserId);
    const {
      projectId = task.projectId,
      assigneeId = task.assigneeId,
      ...fields
    } = updateTaskDto;

    const project = await this.projectsService.findOneForUser(
      projectId,
      currentUserId,
    );
    this.assertAssignable(project, assigneeId);

    const movesProject = projectId !== task.projectId;

    await this.tasksRepository.save(
      this.tasksRepository.merge(task, fields, {
        project: { id: projectId },
        assignee: assigneeId === null ? null : { id: assigneeId },
        ...(movesProject && { sprint: null }),
      }),
    );

    return await this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    await this.findOneForUser(id, currentUserId);
    await this.tasksRepository.delete(id);
  }

  async assertInProject(projectId: number, taskIds: number[]): Promise<void> {
    const projectTaskIds = new Set(
      (await this.findByProjects([projectId])).map((task) => task.id),
    );

    if (taskIds.some((taskId) => !projectTaskIds.has(taskId))) {
      throw new BadRequestException(
        "Every scheduled task must belong to the sprint's project.",
      );
    }
  }

  async scheduleInSprint(
    sprintId: number,
    projectId: number,
    taskIds: number[],
  ): Promise<void> {
    await this.assertInProject(projectId, taskIds);

    const selected = new Set(taskIds);
    const unscheduled = (await this.findByProjects([projectId]))
      .filter((task) => task.sprintId === sprintId && !selected.has(task.id))
      .map((task) => task.id);

    if (unscheduled.length) {
      await this.tasksRepository.update(
        { id: In(unscheduled) },
        { sprint: null },
      );
    }
    if (taskIds.length) {
      await this.tasksRepository.update(
        { id: In(taskIds) },
        { sprint: { id: sprintId } },
      );
    }
  }

  @OnEvent(ProjectUserRemovedEvent.NAME)
  async unassignFromProject({
    projectId,
    userId,
  }: ProjectUserRemovedEvent): Promise<void> {
    const assigned = (await this.findByProjects([projectId]))
      .filter((task) => task.assigneeId === userId)
      .map((task) => task.id);

    if (assigned.length) {
      await this.tasksRepository.update(
        { id: In(assigned) },
        { assignee: null },
      );
    }
  }

  private async getWorkload(
    project: Project,
    tasks: Task[],
  ): Promise<{ name: string | null; openTasks: number }[]> {
    const open = tasks.filter((task) => task.status !== 'done');
    const users = await this.usersService.findByIds(project.userIds);

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

    return tasks
      .filter((task) => task.assigneeId === userId)
      .sort((a, b) => {
        const aDone = a.status === 'done' ? 1 : 0;
        const bDone = b.status === 'done' ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;

        return (a.dueDate ?? farFuture).localeCompare(b.dueDate ?? farFuture);
      });
  }

  private assertAssignable(project: Project, assigneeId: number | null): void {
    if (
      assigneeId !== null &&
      !this.projectsService.hasUser(project, assigneeId)
    ) {
      throw new BadRequestException(
        'The assignee must be a user of the project.',
      );
    }
  }
}
