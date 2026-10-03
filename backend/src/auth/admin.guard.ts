// Author: Mateo Garcia Carreno

// external imports
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

// internal imports
import { readCurrentUserId } from '../common/current-user-id.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = readCurrentUserId(request);

    let user: User;
    try {
      user = await this.usersService.findOne(userId);
    } catch (error) {
      // A header naming a deleted user is a stale session, not a missing
      // resource, so it answers like any other unauthenticated request.
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Sign in to continue.');
      }
      throw error;
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can do this.');
    }

    return true;
  }
}
