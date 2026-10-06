// Developed by Mateo Garcia Carreno

// External imports
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Internal imports
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from '../../types/TasksTypes.js';
import { Trim } from '../../common/trim.decorator.js';

export class CreateTaskDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
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
