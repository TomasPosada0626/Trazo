// Author: Mateo Garcia Carreno

// external imports
import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';

// internal imports
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Query('sprintId', new ParseIntPipe({ optional: true }))
    sprintId: number | undefined,
    @Query('status') status: string | undefined,
    @CurrentUserId() currentUserId: number,
  ): ReturnType<DashboardService['getDashboard']> {
    return this.dashboardService.getDashboard(
      projectId,
      sprintId,
      status,
      currentUserId,
    );
  }
}
