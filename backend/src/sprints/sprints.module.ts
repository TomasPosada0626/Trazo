// Author: Mateo Garcia Carreno

// external imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// internal imports
import { Sprint } from './entities/sprint.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Sprint])],
})
export class SprintsModule {}
