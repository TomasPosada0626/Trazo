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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AuthGuard } from '../auth/auth.guard.js';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { Task } from './entities/task.entity.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('projectId', new ParseIntPipe({ optional: true }))
    projectId: number | undefined,
    @Request() req: UserRequestInterface,
  ): Promise<Task[]> {
    return this.tasksService.findAllWithNames(req.user.sub, projectId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<Task> {
    return this.tasksService.findOneForUser(id, req.user.sub);
  }

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: UserRequestInterface,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: UserRequestInterface,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, req.user.sub);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<void> {
    return this.tasksService.remove(id, req.user.sub);
  }
}
