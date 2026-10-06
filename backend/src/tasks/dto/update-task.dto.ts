// Developed by Mateo Garcia Carreno

// External imports
import { PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
