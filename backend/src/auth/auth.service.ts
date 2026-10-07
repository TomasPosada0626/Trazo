// Developed by Mateo Garcia Carreno

// External imports
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Internal imports
import type { JWTPayloadInterface } from '../interfaces/auth/JWTPayloadInterface.js';
import { PasswordUtils } from '../common/password.utils.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    if (!email || !password) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    const user = await this.usersService.findByEmailWithPassword(email.trim());

    if (!user || !(await PasswordUtils.matches(password, user.password))) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    const payload: JWTPayloadInterface = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
