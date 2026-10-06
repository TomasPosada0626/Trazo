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
} from '@nestjs/common';

// internal imports
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { Task } from './entities/task.entity.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('projectId', new ParseIntPipe({ optional: true }))
    projectId: number | undefined,
    @CurrentUserId() currentUserId: number,
  ): Promise<Task[]> {
    return this.tasksService.findAllWithNames(currentUserId, projectId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<Task> {
    return this.tasksService.findOneForUser(id, currentUserId);
  }

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, currentUserId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, currentUserId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    return this.tasksService.remove(id, currentUserId);
  }
}
