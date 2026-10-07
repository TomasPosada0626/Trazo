// Developed by Mateo Garcia Carreno

// External imports
import { PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
