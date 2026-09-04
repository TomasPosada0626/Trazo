// Author: Hever-Alfonso

// internal imports
import type { TaskInterface } from '@/interfaces/TaskInterface';

/**
 * `id` and `createdAt` are assigned by TaskService.create(), so neither is
 * caller input. Everything else, `projectId` included, comes from the form:
 * a task cannot exist without the project it belongs to.
 */
export type CreateTaskDTO = Omit<TaskInterface, 'id' | 'createdAt'>;
