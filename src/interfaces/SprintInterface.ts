export type SprintStatus = 'planned' | 'active' | 'completed';

export interface SprintInterface {
  id: string;
  name: string;
  goal: string;
  /** ISO 8601 string. */
  startDate: string;
  /** ISO 8601 string. */
  endDate: string;
  status: SprintStatus;
  projectId: string;
}
