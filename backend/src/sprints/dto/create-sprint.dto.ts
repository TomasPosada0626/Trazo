// Developed by Mateo Garcia Carreno

// External imports
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

// Internal imports
import {
  SPRINT_STATUSES,
  type SprintStatus,
} from '../../types/SprintsTypes.js';
import { Trim } from '../../common/trim.decorator.js';

export class CreateSprintDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
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
