// Author: Mateo Garcia Carreno

// external imports
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

// internal imports
import { Trim } from '../../common/trim.decorator.js';
import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from '../entities/project.entity.js';

export class CreateProjectDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsString()
  description: string;

  @IsIn(PROJECT_STATUSES)
  status: ProjectStatus;
}
