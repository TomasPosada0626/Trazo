// Developed by Mateo Garcia Carreno

// External imports
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

// Internal imports
import { User } from '../users/entities/user.entity.js';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequestInterface>();

    let user: User;
    try {
      user = await this.usersService.findOne(request.user.sub);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
      throw error;
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can do this.');
    }

    return true;
  }
}
