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
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AdminGuard } from '../auth/admin.guard.js';
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { FindSprintsQueryDto } from './dto/find-sprints-query.dto.js';
import type { SprintRowDto } from './dto/sprint-row.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { Sprint } from './entities/sprint.entity.js';
import { SprintsService } from './sprints.service.js';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  findAll(
    @Query() query: FindSprintsQueryDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<SprintRowDto[]> {
    return this.sprintsService.findRowsForUser(currentUserId, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<Sprint> {
    return this.sprintsService.findOneForUser(id, currentUserId);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body() createSprintDto: CreateSprintDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<Sprint> {
    return this.sprintsService.create(createSprintDto, currentUserId);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSprintDto: UpdateSprintDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<Sprint> {
    return this.sprintsService.update(id, updateSprintDto, currentUserId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    return this.sprintsService.remove(id, currentUserId);
  }
}
