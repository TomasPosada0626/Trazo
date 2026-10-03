// Author: Mateo Garcia Carreno

// external imports
import { PartialType } from '@nestjs/mapped-types';

// internal imports
import { CreateProjectDto } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
