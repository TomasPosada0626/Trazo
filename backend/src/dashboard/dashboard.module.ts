// Author: Mateo Garcia Carreno

// external imports
import { Module } from '@nestjs/common';

// internal imports
import { ProjectsModule } from '../projects/projects.module.js';
import { SprintsModule } from '../sprints/sprints.module.js';
import { TasksModule } from '../tasks/tasks.module.js';
import { UsersModule } from '../users/users.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [ProjectsModule, SprintsModule, TasksModule, UsersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
