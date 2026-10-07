// Developed by Mateo Garcia Carreno

// External imports
import type { Request } from 'express';

// Internal imports
import type { JWTPayloadInterface } from './JWTPayloadInterface.js';

export interface UserRequestInterface extends Request {
  user: JWTPayloadInterface;
}
