// Developed by Mateo Garcia Carreno

// Internal imports
import type { CreateSprintDTO } from '@/dtos/sprintDTO/CreateSprintDTO';

export type UpdateSprintDTO = Partial<Omit<CreateSprintDTO, 'projectId'>>;
