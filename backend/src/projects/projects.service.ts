// Developed by Mateo Garcia Carreno

// External imports
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { CreateProjectDto } from './dto/create-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectUserRemovedEvent } from './events/project-user-removed.event.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAllForUser(userId: number): Promise<Project[]> {
    return await this.projectsRepository.find({
      where: { users: { id: userId } },
      order: { id: 'ASC' },
    });
  }

  async findAllWithTaskCounts(userId: number): Promise<Project[]> {
    const projects = await this.findAllForUser(userId);
    if (!projects.length) return [];

    const counts = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoin('project.tasks', 'task')
      .select('project.id', 'id')
      .addSelect('COUNT(task.id)', 'total')
      .addSelect('COUNT(CASE WHEN task.status = :done THEN 1 END)', 'done')
      .setParameter('done', 'done')
      .whereInIds(projects.map((project) => project.id))
      .groupBy('project.id')
      .getRawMany<{ id: number; total: number; done: number }>();
    const countsById = new Map(counts.map((row) => [row.id, row]));

    for (const project of projects) {
      const { total = 0, done = 0 } = countsById.get(project.id) ?? {};
      project.taskCount = total;
      project.progress = total ? Math.round((done / total) * 100) : 0;
    }

    return projects;
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOneBy({ id });
    if (!project) {
      throw new NotFoundException('The project does not exist.');
    }

    return project;
  }

  async findOneForUser(id: number, userId: number): Promise<Project> {
    const project = await this.findOne(id);

    if (!this.hasUser(project, userId)) {
      throw new NotFoundException('The project does not exist.');
    }

    return project;
  }

  async create(
    createProjectDto: CreateProjectDto,
    currentUserId: number,
  ): Promise<Project> {
    await this.usersService.findOne(currentUserId);

    const project = this.projectsRepository.merge(
      this.projectsRepository.create(createProjectDto),
      { users: [{ id: currentUserId }] },
    );
    const saved = await this.projectsRepository.save(project);

    return await this.findOne(saved.id);
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    currentUserId: number,
  ): Promise<Project> {
    const project = await this.findOneForUser(id, currentUserId);

    await this.projectsRepository.save(
      this.projectsRepository.merge(project, updateProjectDto),
    );

    return await this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    await this.findOneForUser(id, currentUserId);

    await this.projectsRepository.delete(id);
  }

  async getUsers(id: number, currentUserId: number): Promise<User[]> {
    const project = await this.findOneForUser(id, currentUserId);

    return await this.usersService.findByIds(project.userIds);
  }

  async getAvailableUsers(id: number, currentUserId: number): Promise<User[]> {
    const project = await this.findOneForUser(id, currentUserId);

    return await this.usersService.findAllExcept(project.userIds);
  }

  async addUser(
    id: number,
    userId: number,
    currentUserId: number,
  ): Promise<User[]> {
    const project = await this.findOneForUser(id, currentUserId);
    await this.usersService.findOne(userId);
    if (this.hasUser(project, userId)) {
      throw new ConflictException('The user is already on the project.');
    }

    await this.projectsRepository
      .createQueryBuilder()
      .relation(Project, 'users')
      .of(id)
      .add(userId);

    return await this.getUsers(id, currentUserId);
  }

  async removeUser(
    id: number,
    userId: number,
    currentUserId: number,
  ): Promise<User[]> {
    if (userId === currentUserId) {
      throw new BadRequestException(
        'You cannot remove yourself from a project.',
      );
    }

    const project = await this.findOneForUser(id, currentUserId);
    if (!this.hasUser(project, userId)) {
      throw new NotFoundException('The user is not on the project.');
    }

    await this.projectsRepository
      .createQueryBuilder()
      .relation(Project, 'users')
      .of(id)
      .remove(userId);

    await this.eventEmitter.emitAsync(
      ProjectUserRemovedEvent.NAME,
      new ProjectUserRemovedEvent(id, userId),
    );

    return await this.getUsers(id, currentUserId);
  }

  hasUser(project: Project, userId: number): boolean {
    return project.userIds.includes(userId);
  }
}
