// Author: Mateo Garcia Carreno

// external imports
import { Injectable, UnauthorizedException } from '@nestjs/common';

// internal imports
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    // One message for both failures, so the response does not reveal which
    // emails have an account.
    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    return this.usersService.findOne(user.id);
  }
}
