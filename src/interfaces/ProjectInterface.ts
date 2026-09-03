export type ProjectStatus = 'planning' | 'active' | 'at_risk' | 'paused' | 'completed';

export interface ProjectInterface {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  /** ISO 8601 string. See the dates decision in CLAUDE.md. */
  createdAt: string;
  /**
   * Members of the project. This is the owning side of the User *—* Project
   * relation, so it is stored here and nowhere else; a user's projects are
   * derived with UserService.getProjects(user).
   */
  memberIds: number[];
}
