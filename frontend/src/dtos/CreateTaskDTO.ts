// Author: Hever-Alfonso

// internal imports
import type { TaskInterface } from '@/interfaces/TaskInterface';

/**
 * `id` and `createdAt` are assigned by TaskService.create(), and so is
 * `sprintId`: a new task always starts in the backlog, because work is
 * scheduled from SprintForm through SprintService.setTasks() and never here.
 * Everything else, `projectId` included, comes from the form: a task cannot
 * exist without the project it belongs to.
 */
export type CreateTaskDTO = Omit<TaskInterface, 'id' | 'createdAt' | 'sprintId'>;
