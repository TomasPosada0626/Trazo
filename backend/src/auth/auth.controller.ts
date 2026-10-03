// Author: Mateo Garcia Carreno

// external imports
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

// internal imports
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<User> {
    return this.authService.login(loginDto);
  }
}
