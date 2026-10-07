// Developed by Mateo Garcia Carreno

// External imports
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Internal imports
import { Trim } from '../../common/trim.decorator.js';
import { USER_ROLES, type UserRole } from '../../types/UsersTypes.js';

export class CreateUserDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Trim()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @IsIn(USER_ROLES)
  role: UserRole;
}
