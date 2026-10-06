// Developed by Mateo Garcia Carreno

// Internal imports
import type { SprintInterface } from '@/interfaces/SprintInterface';

export type CreateSprintDTO = Omit<
  SprintInterface,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'committedPoints'
  | 'completedPoints'
  | 'taskCount'
  | 'remainingDays'
> & { taskIds: number[] };
