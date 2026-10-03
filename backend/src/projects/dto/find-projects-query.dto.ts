// Author: Mateo Garcia Carreno

// external imports
import { IsIn, IsOptional } from 'class-validator';

// internal imports
import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from '../entities/project.entity.js';

export class FindProjectsQueryDto {
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: ProjectStatus;
}
