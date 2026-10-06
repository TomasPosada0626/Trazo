// Developed by Mateo Garcia Carreno

// Internal imports
import type { SprintStatus } from '@/types/SprintTypes';

export interface SprintInterface {
  id: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
  projectId: number;
  committedPoints?: number;
  completedPoints?: number;
  taskCount?: number;
  remainingDays?: number;
}
