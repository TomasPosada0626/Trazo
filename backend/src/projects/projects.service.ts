// Author: Mateo Garcia Carreno

// external imports
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// internal imports
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { FindProjectsQueryDto } from './dto/find-projects-query.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectUserRemovedEvent } from './events/project-user-removed.event.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  findAllForUser(
    userId: number,
    { status }: FindProjectsQueryDto = {},
  ): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { users: { id: userId }, ...(status && { status }) },
      order: { id: 'ASC' },
    });
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

    // Same response as a missing project, so a non-user cannot tell the
    // difference between "not yours" and "not there".
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

    // The creator joins the roster, or the project would be invisible to the
    // person who just made it.
    const project = this.projectsRepository.merge(
      this.projectsRepository.create(createProjectDto),
      { users: [{ id: currentUserId }] },
    );
    const saved = await this.projectsRepository.save(project);

    return this.findOne(saved.id);
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

    return this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    await this.findOneForUser(id, currentUserId);

    // The foreign keys delete the project's sprints and tasks with it.
    await this.projectsRepository.delete(id);
  }

  async getUsers(id: number, currentUserId: number): Promise<User[]> {
    const project = await this.findOneForUser(id, currentUserId);

    return this.usersService.findByIds(project.userIds);
  }

  async getAvailableUsers(id: number, currentUserId: number): Promise<User[]> {
    const project = await this.findOneForUser(id, currentUserId);

    return this.usersService.findAllExcept(project.userIds);
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

    return this.getUsers(id, currentUserId);
  }

  async removeUser(
    id: number,
    userId: number,
    currentUserId: number,
  ): Promise<User[]> {
    // Refusing self-removal is what guarantees at least one admin user
    // remains: to leave a project you administer, delete it.
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

    // TasksService listens and unassigns the user's tasks in this project.
    // emitAsync waits for it, so the response reflects both writes and a
    // failure in the listener reaches the caller.
    await this.eventEmitter.emitAsync(
      ProjectUserRemovedEvent.NAME,
      new ProjectUserRemovedEvent(id, userId),
    );

    return this.getUsers(id, currentUserId);
  }

  hasUser(project: Project, userId: number): boolean {
    return project.userIds.includes(userId);
  }
}
