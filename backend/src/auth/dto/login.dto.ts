// Author: Mateo Garcia Carreno

// external imports
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// internal imports
import { Trim } from '../../common/trim.decorator.js';

export class LoginDto {
  @Trim()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
