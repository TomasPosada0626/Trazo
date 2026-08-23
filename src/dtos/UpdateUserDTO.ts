import type { CreateUserDTO } from '@/dtos/CreateUserDTO';

/** Every user field is optional, so updates can change only selected values. */
export type UpdateUserDTO = Partial<CreateUserDTO>;