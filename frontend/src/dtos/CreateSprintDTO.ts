// Author: Mateo Garcia Carreno

// internal imports
import type { SprintInterface } from '@/interfaces/SprintInterface';

/**
 * `id` is assigned by SprintService.create().
 *
 * `taskIds` is not a field of the stored sprint — the relation lives on
 * `task.sprintId` — so create() and update() pass it to setTasks() instead of
 * writing it to the record. An empty array is valid: a sprint can be planned
 * before any work is scheduled into it.
 */
export type CreateSprintDTO = Omit<SprintInterface, 'id'> & { taskIds: number[] };
