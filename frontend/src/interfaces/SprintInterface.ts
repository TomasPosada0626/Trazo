// Author: Mateo Garcia Carreno

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface SprintInterface {
  id: number;
  name: string;
  goal: string;
  /** ISO 8601 string. */
  startDate: string;
  /** ISO 8601 string. */
  endDate: string;
  status: SprintStatus;
  projectId: number;
}
