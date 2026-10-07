// Developed by Mateo Garcia Carreno

export const SPRINT_STATUSES = ['planned', 'active', 'completed'] as const;

export type SprintStatus = (typeof SPRINT_STATUSES)[number];
