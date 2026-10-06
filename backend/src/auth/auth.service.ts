// Author: Mateo Garcia Carreno

// external imports
import { Injectable, UnauthorizedException } from '@nestjs/common';

// internal imports
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(email: string, password: string): Promise<User> {
    // No DTO validates the body, so a missing field is caught here, before an
    // undefined email reaches the query.
    if (!email || !password) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    const user = await this.usersService.findByEmailWithPassword(email.trim());

    // One message for both failures, so the response does not reveal which
    // emails have an account.
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    return this.usersService.findOne(user.id);
  }
}
