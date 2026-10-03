// Author: Mateo Garcia Carreno

// internal imports
import type { Sprint } from '../entities/sprint.entity.js';

export type SprintRowDto = Sprint & {
  committedPoints: number;
  completedPoints: number;
  taskCount: number;
  remainingDays: number;
};
