// Developed by Mateo Garcia Carreno

// External imports
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Internal imports
import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from '../../types/ProjectsTypes.js';
import { Trim } from '../../common/trim.decorator.js';

export class CreateProjectDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Trim()
  @IsString()
  description: string;

  @IsIn(PROJECT_STATUSES)
  status: ProjectStatus;
}
