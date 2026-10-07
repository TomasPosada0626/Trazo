// Developed by Tomás Posada

// External imports
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Internal imports
import { Trim } from '../../common/trim.decorator.js';

export class SignInDto {
  @Trim()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;
}
