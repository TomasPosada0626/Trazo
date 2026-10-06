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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

// Internal imports
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { Task } from './entities/task.entity.js';
import { TasksService } from './tasks.service.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface.js';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query('projectId', new ParseIntPipe({ optional: true }))
    projectId: number | undefined,
    @Request() req: UserRequestInterface,
  ): Promise<Task[]> {
    return await this.tasksService.findAllWithNames(req.user.sub, projectId);
  }

  @Get('stats')
  async getStats(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Query('sprintId', new ParseIntPipe({ optional: true }))
    sprintId: number | undefined,
    @Query('status') status: string | undefined,
    @Request() req: UserRequestInterface,
  ): ReturnType<TasksService['getStats']> {
    return await this.tasksService.getStats(
      req.user.sub,
      projectId,
      sprintId,
      status,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<Task> {
    return await this.tasksService.findOneForUser(id, req.user.sub);
  }

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: UserRequestInterface,
  ): Promise<Task> {
    return await this.tasksService.create(createTaskDto, req.user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: UserRequestInterface,
  ): Promise<Task> {
    return await this.tasksService.update(id, updateTaskDto, req.user.sub);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<void> {
    return await this.tasksService.remove(id, req.user.sub);
  }
}
