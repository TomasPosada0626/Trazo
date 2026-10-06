// Author: Mateo Garcia Carreno

// external imports
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AdminGuard } from '../auth/admin.guard.js';
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUserId() currentUserId: number): Promise<Project[]> {
    return this.projectsService.findAllWithProgress(currentUserId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<Project> {
    return this.projectsService.findOneForUser(id, currentUserId);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<Project> {
    return this.projectsService.create(createProjectDto, currentUserId);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, currentUserId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    return this.projectsService.remove(id, currentUserId);
  }

  @Get(':id/users')
  getUsers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<User[]> {
    return this.projectsService.getUsers(id, currentUserId);
  }

  @Get(':id/available-users')
  @UseGuards(AdminGuard)
  getAvailableUsers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<User[]> {
    return this.projectsService.getAvailableUsers(id, currentUserId);
  }

  @Post(':id/users')
  @UseGuards(AdminGuard)
  addUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<User[]> {
    return this.projectsService.addUser(id, userId, currentUserId);
  }

  @Delete(':id/users/:userId')
  @UseGuards(AdminGuard)
  removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<User[]> {
    return this.projectsService.removeUser(id, userId, currentUserId);
  }
}
