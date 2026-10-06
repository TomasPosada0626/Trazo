// Developed by Hever-Alfonso

// Internal imports
import type { TaskInterface } from '@/interfaces/TaskInterface';

export type CreateTaskDTO = Omit<
  TaskInterface,
  'id' | 'createdAt' | 'updatedAt' | 'sprintId' | 'projectName' | 'assigneeName'
>;
