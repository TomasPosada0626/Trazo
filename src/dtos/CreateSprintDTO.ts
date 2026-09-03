import type { SprintInterface } from '@/interfaces/SprintInterface';

/** `id` is assigned by SprintService.create(). */
export type CreateSprintDTO = Omit<SprintInterface, 'id'>;
