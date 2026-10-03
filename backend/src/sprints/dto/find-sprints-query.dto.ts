// Author: Mateo Garcia Carreno

// external imports
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class FindSprintsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;
}
