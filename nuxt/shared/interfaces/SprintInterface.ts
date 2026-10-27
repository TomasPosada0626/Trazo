// Developed by Mateo Garcia Carreno

// Internal imports
import type { SprintStatus } from '#shared/types/SprintTypes';

export interface SprintInterface {
  id: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  committedPoints: number;
  completedPoints: number;
}
