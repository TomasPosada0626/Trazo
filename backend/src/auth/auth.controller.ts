// Author: Mateo Garcia Carreno

// external imports
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

// internal imports
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.authService.login(email, password);
  }
}
