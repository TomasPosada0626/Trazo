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
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { Sprint } from './entities/sprint.entity.js';
import { SprintsService } from './sprints.service.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface.js';

@Controller('sprints')
@UseGuards(AuthGuard)
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  async findAll(
    @Query('projectId', new ParseIntPipe({ optional: true }))
    projectId: number | undefined,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint[]> {
    return await this.sprintsService.findAllWithPoints(req.user.sub, projectId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint> {
    return await this.sprintsService.findOneForUser(id, req.user.sub);
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(
    @Body() createSprintDto: CreateSprintDto,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint> {
    return await this.sprintsService.create(createSprintDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSprintDto: UpdateSprintDto,
    @Request() req: UserRequestInterface,
  ): Promise<Sprint> {
    return await this.sprintsService.update(id, updateSprintDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: UserRequestInterface,
  ): Promise<void> {
    return await this.sprintsService.remove(id, req.user.sub);
  }
}
