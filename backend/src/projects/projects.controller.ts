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
  Request,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AuthGuard } from '../auth/auth.guard.js';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { User } from '../users/entities/user.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Request() req: UserRequestInterface): Promise<Project[]> {
    return this.projectsService.findAllWithTaskCounts(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<Project> {
    return this.projectsService.findOneForUser(id, req.user.sub);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: UserRequestInterface,
  ): Promise<Project> {
    return this.projectsService.create(createProjectDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: UserRequestInterface,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<void> {
    return this.projectsService.remove(id, req.user.sub);
  }

  @Get(':id/users')
  getUsers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return this.projectsService.getUsers(id, req.user.sub);
  }

  @Get(':id/available-users')
  @UseGuards(AdminGuard)
  getAvailableUsers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return this.projectsService.getAvailableUsers(id, req.user.sub);
  }

  @Post(':id/users')
  @UseGuards(AdminGuard)
  addUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return this.projectsService.addUser(id, userId, req.user.sub);
  }

  @Delete(':id/users/:userId')
  @UseGuards(AdminGuard)
  removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return this.projectsService.removeUser(id, userId, req.user.sub);
  }
}
