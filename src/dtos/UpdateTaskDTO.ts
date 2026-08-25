import type { CreateTaskDTO } from '@/dtos/CreateTaskDTO';

/** Every editable field is optional, so a form can send only what changed. */
export type UpdateTaskDTO = Partial<CreateTaskDTO>;
