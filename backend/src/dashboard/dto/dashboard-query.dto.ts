// Author: Mateo Garcia Carreno

// external imports
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

// internal imports
import {
  TASK_STATUSES,
  type TaskStatus,
} from '../../tasks/entities/task.entity.js';

export class DashboardQueryDto {
  @Type(() => Number)
  @IsInt()
  projectId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sprintId?: number;

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;
}
