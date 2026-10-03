// Author: Mateo Garcia Carreno

// external imports
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

// internal imports
import { AuthModule } from './auth/auth.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { HomeModule } from './home/home.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { SprintsModule } from './sprints/sprints.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.SQLITE_PATH ?? 'database.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    EventEmitterModule.forRoot(),
    HomeModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    DashboardModule,
  ],
})
export class AppModule {}
