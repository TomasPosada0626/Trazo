// Author: Mateo Garcia Carreno

// external imports
import { PartialType } from '@nestjs/mapped-types';

// internal imports
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
