// Developed by Mateo Garcia Carreno

// External imports
import { OmitType, PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreateSprintDto } from './create-sprint.dto.js';

export class UpdateSprintDto extends PartialType(
  OmitType(CreateSprintDto, ['projectId'] as const),
) {}
