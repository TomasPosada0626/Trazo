// Author: Mateo Garcia Carreno

// external imports
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

// internal imports
import { Trim } from '../../common/trim.decorator.js';
import {
  SPRINT_STATUSES,
  type SprintStatus,
} from '../entities/sprint.entity.js';

export class CreateSprintDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsString()
  goal: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsIn(SPRINT_STATUSES)
  status: SprintStatus;

  @IsInt()
  projectId: number;

  @IsArray()
  @IsInt({ each: true })
  taskIds: number[];
}
