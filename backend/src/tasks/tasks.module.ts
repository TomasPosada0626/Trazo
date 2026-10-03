// Author: Mateo Garcia Carreno

// external imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// internal imports
import { Task } from './entities/task.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
})
export class TasksModule {}
