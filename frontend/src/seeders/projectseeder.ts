// Author: Mateo Garcia Carreno

// internal imports
import type { ProjectInterface } from '@/interfaces/ProjectInterface';

export const projectSeeder: ProjectInterface[] = [
  {
    id: 1,
    name: 'Mobile App Redesign',
    description: 'Complete overhaul of the mobile experience.',
    status: 'active',
    createdAt: '2026-02-02',
    userIds: [1, 2],
  },
  {
    id: 2,
    name: 'Customer Portal',
    description: 'Account and billing self-service.',
    status: 'active',
    createdAt: '2026-03-18',
    userIds: [3],
  },
  {
    id: 3,
    name: 'Cloud Migration',
    description: 'Move the legacy infrastructure over.',
    status: 'at_risk',
    createdAt: '2026-01-05',
    userIds: [3, 2],
  },
  {
    id: 4,
    name: 'Loyalty Program',
    description: 'Points and rewards system.',
    status: 'completed',
    createdAt: '2025-09-11',
    userIds: [1],
  },
];
