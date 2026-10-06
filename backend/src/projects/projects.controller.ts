// Developed by Mateo Garcia Carreno

// External imports
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

// Internal imports
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectsService } from './projects.service.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { User } from '../users/entities/user.entity.js';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface.js';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Request() req: UserRequestInterface): Promise<Project[]> {
    return await this.projectsService.findAllWithTaskCounts(req.user.sub);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<Project> {
    return await this.projectsService.findOneForUser(id, req.user.sub);
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: UserRequestInterface,
  ): Promise<Project> {
    return await this.projectsService.create(createProjectDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: UserRequestInterface,
  ): Promise<Project> {
    return await this.projectsService.update(
      id,
      updateProjectDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<void> {
    return await this.projectsService.remove(id, req.user.sub);
  }

  @Get(':id/users')
  async getUsers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return await this.projectsService.getUsers(id, req.user.sub);
  }

  @Get(':id/available-users')
  @UseGuards(AdminGuard)
  async getAvailableUsers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return await this.projectsService.getAvailableUsers(id, req.user.sub);
  }

  @Post(':id/users')
  @UseGuards(AdminGuard)
  async addUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return await this.projectsService.addUser(id, userId, req.user.sub);
  }

  @Delete(':id/users/:userId')
  @UseGuards(AdminGuard)
  async removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: UserRequestInterface,
  ): Promise<User[]> {
    return await this.projectsService.removeUser(id, userId, req.user.sub);
  }
}
