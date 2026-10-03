// Author: Mateo Garcia Carreno

// external imports
import { PartialType } from '@nestjs/mapped-types';

// internal imports
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
