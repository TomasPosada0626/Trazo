// Author: Mateo Garcia Carreno

// internal imports
import type { Task } from '../entities/task.entity.js';

export type TaskRowDto = Task & {
  projectName: string;
  assigneeName: string | null;
};
