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
  /**
   * Points the team committed to at sprint planning. Stored, because it is a
   * decision made at a point in time — not the current sum of task points,
   * which drifts as tasks are added or removed.
   */
  totalCommittedPoints: number;
  projectId: string;
}
