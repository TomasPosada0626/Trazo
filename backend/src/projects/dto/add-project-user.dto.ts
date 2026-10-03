// Author: Mateo Garcia Carreno

// external imports
import { IsInt } from 'class-validator';

export class AddProjectUserDto {
  @IsInt()
  userId: number;
}
