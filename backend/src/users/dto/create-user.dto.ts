// Author: Mateo Garcia Carreno

// external imports
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

// internal imports
import { Trim } from '../../common/trim.decorator.js';
import { USER_ROLES, type UserRole } from '../entities/user.entity.js';

export class CreateUserDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsIn(USER_ROLES)
  role: UserRole;
}
