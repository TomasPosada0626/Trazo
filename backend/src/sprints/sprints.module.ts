// Developed by Mateo Garcia Carreno

// External imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Internal imports
import { ProjectsModule } from '../projects/projects.module.js';
import { Sprint } from './entities/sprint.entity.js';
import { SprintsController } from './sprints.controller.js';
import { SprintsService } from './sprints.service.js';
import { TasksModule } from '../tasks/tasks.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sprint]),
    ProjectsModule,
    TasksModule,
    UsersModule,
  ],
  controllers: [SprintsController],
  providers: [SprintsService],
  exports: [SprintsService],
})
export class SprintsModule {}
