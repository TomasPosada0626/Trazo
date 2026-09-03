// Author: Mateo Garcia Carreno

// internal imports
import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';

/** Every editable field is optional, so a form can send only what changed. */
export type UpdateProjectDTO = Partial<CreateProjectDTO>;
