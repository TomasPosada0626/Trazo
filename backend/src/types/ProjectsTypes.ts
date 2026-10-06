// Developed by Mateo Garcia Carreno

export const PROJECT_STATUSES = [
  'planning',
  'active',
  'at_risk',
  'paused',
  'completed',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
