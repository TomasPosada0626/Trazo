// Author: Mateo Garcia Carreno

// external imports
import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AuthGuard } from '../auth/auth.guard.js';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface.js';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Query('sprintId', new ParseIntPipe({ optional: true }))
    sprintId: number | undefined,
    @Query('status') status: string | undefined,
    @Request() req: UserRequestInterface,
  ): ReturnType<DashboardService['getDashboard']> {
    return this.dashboardService.getDashboard(
      projectId,
      sprintId,
      status,
      req.user.sub,
    );
  }
}
