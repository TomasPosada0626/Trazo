// Developed by Mateo Garcia Carreno

// External imports
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Internal imports
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { DateUtils } from '../common/date.utils.js';
import { ProjectsService } from '../projects/projects.service.js';
import { Sprint } from './entities/sprint.entity.js';
import { TasksService } from '../tasks/tasks.service.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint)
    private sprintsRepository: Repository<Sprint>,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  async findAllWithPoints(
    userId: number,
    projectId?: number,
  ): Promise<Sprint[]> {
    let projectIds: number[];
    if (projectId !== undefined) {
      await this.projectsService.findOneForUser(projectId, userId);
      projectIds = [projectId];
    } else {
      const projects = await this.projectsService.findAllForUser(userId);
      projectIds = projects.map((project) => project.id);
    }

    const sprints = await this.sprintsRepository.find({
      where: { project: { id: In(projectIds) } },
      order: { id: 'ASC' },
    });
    await this.addPoints(sprints);

    const today = DateUtils.startOfToday();
    for (const sprint of sprints) {
      sprint.remainingDays = Math.max(
        0,
        DateUtils.daysBetween(today, sprint.endDate),
      );
    }

    return sprints;
  }

  async findOne(id: number): Promise<Sprint> {
    const sprint = await this.sprintsRepository.findOneBy({ id });
    if (!sprint) {
      throw new NotFoundException('The sprint does not exist.');
    }

    return sprint;
  }

  async findOneForUser(id: number, userId: number): Promise<Sprint> {
    const sprint = await this.findOne(id);
    const project = await this.projectsService.findOne(sprint.projectId);

    if (!this.projectsService.hasUser(project, userId)) {
      throw new NotFoundException('The sprint does not exist.');
    }

    return sprint;
  }

  async create(
    createSprintDto: CreateSprintDto,
    currentUserId: number,
  ): Promise<Sprint> {
    const { projectId, taskIds, ...fields } = createSprintDto;
    await this.projectsService.findOneForUser(projectId, currentUserId);
    this.assertDateRange(fields.startDate, fields.endDate);
    await this.assertNameAvailable(fields.name, projectId);

    await this.tasksService.assertInProject(projectId, taskIds);

    const sprint = this.sprintsRepository.create({
      ...fields,
      project: { id: projectId },
    });
    const saved = await this.sprintsRepository.save(sprint);

    await this.tasksService.scheduleInSprint(saved.id, projectId, taskIds);

    return await this.findOne(saved.id);
  }

  async update(
    id: number,
    updateSprintDto: UpdateSprintDto,
    currentUserId: number,
  ): Promise<Sprint> {
    const sprint = await this.findOneForUser(id, currentUserId);
    const { taskIds, ...fields } = updateSprintDto;

    if (fields.name !== undefined) {
      await this.assertNameAvailable(fields.name, sprint.projectId, id);
    }
    this.assertDateRange(
      fields.startDate ?? sprint.startDate,
      fields.endDate ?? sprint.endDate,
    );
    if (taskIds !== undefined) {
      await this.tasksService.assertInProject(sprint.projectId, taskIds);
    }

    await this.sprintsRepository.save(
      this.sprintsRepository.merge(sprint, fields),
    );

    if (taskIds !== undefined) {
      await this.tasksService.scheduleInSprint(id, sprint.projectId, taskIds);
    }

    return await this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    await this.findOneForUser(id, currentUserId);

    await this.sprintsRepository.delete(id);
  }

  private async addPoints(sprints: Sprint[]): Promise<void> {
    if (!sprints.length) return;

    const byId = new Map(sprints.map((sprint) => [sprint.id, sprint]));
    for (const sprint of sprints) {
      sprint.committedPoints = 0;
      sprint.completedPoints = 0;
      sprint.taskCount = 0;
    }

    const projectIds = [...new Set(sprints.map((sprint) => sprint.projectId))];
    const tasks = await this.tasksService.findByProjects(projectIds);
    for (const task of tasks) {
      const sprint =
        task.sprintId === null ? undefined : byId.get(task.sprintId);
      if (!sprint) continue;

      sprint.committedPoints = (sprint.committedPoints ?? 0) + task.storyPoints;
      sprint.taskCount = (sprint.taskCount ?? 0) + 1;
      if (task.status === 'done') {
        sprint.completedPoints =
          (sprint.completedPoints ?? 0) + task.storyPoints;
      }
    }
  }

  private assertDateRange(startDate: string, endDate: string): void {
    if (endDate < startDate) {
      throw new BadRequestException(
        'The end date cannot be before the start date.',
      );
    }
  }

  private async assertNameAvailable(
    name: string,
    projectId: number,
    excludeId?: number,
  ): Promise<void> {
    const normalized = name.trim().toLowerCase();
    const sprints = await this.sprintsRepository.findBy({
      project: { id: projectId },
    });

    const duplicate = sprints.some(
      (sprint) =>
        sprint.id !== excludeId &&
        sprint.name.trim().toLowerCase() === normalized,
    );
    if (duplicate) {
      throw new ConflictException(
        'A sprint with this name already exists in the project.',
      );
    }
  }
}
