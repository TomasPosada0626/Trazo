// Author: Mateo Garcia Carreno

// external imports
import { Controller, Get, Query } from '@nestjs/common';

// internal imports
import { CurrentUserId } from '../common/current-user-id.decorator.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardQueryDto } from './dto/dashboard-query.dto.js';
import type { DashboardDto } from './dto/dashboard.dto.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(
    @Query() query: DashboardQueryDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<DashboardDto> {
    return this.dashboardService.getDashboard(query, currentUserId);
  }
}
