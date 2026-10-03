// Author: Mateo Garcia Carreno

// external imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// internal imports
import { Project } from './entities/project.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
})
export class ProjectsModule {}
