import type { CreateSprintDTO } from '@/dtos/CreateSprintDTO';

/** Every editable field is optional, so a form can send only what changed. */
export type UpdateSprintDTO = Partial<CreateSprintDTO>;
