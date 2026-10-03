// Author: Mateo Garcia Carreno

// external imports
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// internal imports
import { DateUtils } from '../common/date.utils.js';
import { ProjectsService } from '../projects/projects.service.js';
import { TasksService } from '../tasks/tasks.service.js';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { FindSprintsQueryDto } from './dto/find-sprints-query.dto.js';
import type { SprintRowDto } from './dto/sprint-row.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { Sprint } from './entities/sprint.entity.js';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint)
    private sprintsRepository: Repository<Sprint>,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  async findAllForUser(
    userId: number,
    { projectId }: FindSprintsQueryDto = {},
  ): Promise<Sprint[]> {
    let projectIds: number[];
    if (projectId !== undefined) {
      await this.projectsService.findOneForUser(projectId, userId);
      projectIds = [projectId];
    } else {
      const projects = await this.projectsService.findAllForUser(userId);
      projectIds = projects.map((project) => project.id);
    }

    return this.sprintsRepository.find({
      where: { project: { id: In(projectIds) } },
      order: { id: 'ASC' },
    });
  }

  async findRowsForUser(
    userId: number,
    query: FindSprintsQueryDto = {},
  ): Promise<SprintRowDto[]> {
    const sprints = await this.findAllForUser(userId, query);
    const points = await this.getPoints(sprints);
    const today = DateUtils.startOfToday();

    return sprints.map((sprint) =>
      Object.assign(sprint, {
        committedPoints: points.get(sprint.id)?.committedPoints ?? 0,
        completedPoints: points.get(sprint.id)?.completedPoints ?? 0,
        taskCount: points.get(sprint.id)?.taskCount ?? 0,
        remainingDays: Math.max(
          0,
          DateUtils.daysBetween(today, sprint.endDate),
        ),
      }),
    );
  }

  countActive(projectId: number): Promise<number> {
    return this.sprintsRepository.countBy({
      project: { id: projectId },
      status: 'active',
    });
  }

  async getVelocitySeries(projectId: number): Promise<{
    sprintIds: number[];
    committed: number[];
    completed: number[];
  }> {
    // Always the whole project: a velocity chart of a single sprint would be
    // one pair of bars with nothing to compare against.
    const sprints = await this.sprintsRepository.find({
      where: { project: { id: projectId } },
      order: { id: 'ASC' },
    });
    const points = await this.getPoints(sprints);

    return {
      sprintIds: sprints.map((sprint) => sprint.id),
      committed: sprints.map(
        (sprint) => points.get(sprint.id)?.committedPoints ?? 0,
      ),
      completed: sprints.map(
        (sprint) => points.get(sprint.id)?.completedPoints ?? 0,
      ),
    };
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

    // A sprint is visible exactly when its project is.
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

    // Checked before saving, so a bad task id does not leave behind a sprint
    // that was created with none of its work.
    await this.tasksService.assertInProject(projectId, taskIds);

    const sprint = this.sprintsRepository.create({
      ...fields,
      project: { id: projectId },
    });
    const saved = await this.sprintsRepository.save(sprint);

    // The sprint has to exist before a task can point at it.
    await this.tasksService.scheduleInSprint(saved.id, projectId, taskIds);

    return this.findOne(saved.id);
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

    // An empty array is an instruction, not an absence: it clears the sprint.
    if (taskIds !== undefined) {
      await this.tasksService.scheduleInSprint(id, sprint.projectId, taskIds);
    }

    return this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    await this.findOneForUser(id, currentUserId);

    // The foreign key returns the sprint's tasks to the backlog: a task
    // belongs to its project, the sprint is only where it was scheduled.
    await this.sprintsRepository.delete(id);
  }

  private async getPoints(
    sprints: Sprint[],
  ): Promise<
    Map<
      number,
      { committedPoints: number; completedPoints: number; taskCount: number }
    >
  > {
    const points = new Map(
      sprints.map((sprint) => [
        sprint.id,
        { committedPoints: 0, completedPoints: 0, taskCount: 0 },
      ]),
    );
    if (!sprints.length) return points;

    // Summed from the tasks on every read, never stored, so a task changing
    // status or sprint can never leave a total stale.
    const projectIds = [...new Set(sprints.map((sprint) => sprint.projectId))];
    const tasks = await this.tasksService.findByProjects(projectIds);
    for (const task of tasks) {
      const sprintPoints =
        task.sprintId === null ? undefined : points.get(task.sprintId);
      if (!sprintPoints) continue;

      sprintPoints.committedPoints += task.storyPoints;
      sprintPoints.taskCount += 1;
      if (task.status === 'done') {
        sprintPoints.completedPoints += task.storyPoints;
      }
    }

    return points;
  }

  private assertDateRange(startDate: string, endDate: string): void {
    // ISO dates compare correctly as plain strings.
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
