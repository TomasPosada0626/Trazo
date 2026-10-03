// Author: Mateo Garcia Carreno

// external imports
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// internal imports
import { Trim } from '../../common/trim.decorator.js';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from '../entities/task.entity.js';

export class CreateTaskDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Trim()
  @IsString()
  description: string;

  @IsIn(TASK_TYPES)
  type: TaskType;

  @IsInt()
  @Min(0)
  storyPoints: number;

  @IsIn(TASK_PRIORITIES)
  priority: TaskPriority;

  @IsIn(TASK_STATUSES)
  status: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsInt()
  projectId: number;

  @IsOptional()
  @IsInt()
  assigneeId?: number | null;
}
