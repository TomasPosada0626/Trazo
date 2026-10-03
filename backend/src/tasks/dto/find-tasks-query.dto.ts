// Author: Mateo Garcia Carreno

// external imports
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

// internal imports
import { TASK_STATUSES, type TaskStatus } from '../entities/task.entity.js';

export class FindTasksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;
}
