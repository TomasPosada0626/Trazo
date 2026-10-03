// Author: Mateo Garcia Carreno

// external imports
import { OmitType, PartialType } from '@nestjs/mapped-types';

// internal imports
import { CreateSprintDto } from './create-sprint.dto.js';

export class UpdateSprintDto extends PartialType(
  OmitType(CreateSprintDto, ['projectId'] as const),
) {}
