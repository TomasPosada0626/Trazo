// Author: Mateo Garcia Carreno

// external imports
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export function readCurrentUserId(request: Request): number {
  const userId = Number(request.headers['x-user-id']);

  // Without a session token the header is the whole identity, so a request
  // that lacks it is anonymous rather than defaulted to anybody.
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new UnauthorizedException('Sign in to continue.');
  }

  return userId;
}

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number =>
    readCurrentUserId(context.switchToHttp().getRequest<Request>()),
);
