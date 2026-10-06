// Developed by Mateo Garcia Carreno

// External imports
import { PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreateProjectDto } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
