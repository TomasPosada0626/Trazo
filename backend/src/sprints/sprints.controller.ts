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
import { AdminGuard } from '../auth/admin.guard.js';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { Sprint } from './entities/sprint.entity.js';
import { SprintsService } from './sprints.service.js';

@Controller('sprints')
@UseGuards(AuthGuard)
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  findAll(
    @Query('projectId', new ParseIntPipe({ optional: true }))
    projectId: number | undefined,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint[]> {
    return this.sprintsService.findAllWithPoints(req.user.sub, projectId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint> {
    return this.sprintsService.findOneForUser(id, req.user.sub);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body() createSprintDto: CreateSprintDto,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint> {
    return this.sprintsService.create(createSprintDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSprintDto: UpdateSprintDto,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint> {
    return this.sprintsService.update(id, updateSprintDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<void> {
    return this.sprintsService.remove(id, req.user.sub);
  }
}
