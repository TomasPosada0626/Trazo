// Developed by Mateo Garcia Carreno

// External imports
import type { DeepPartial } from 'typeorm';

// Internal imports
import type { Project } from '../projects/entities/project.entity.js';

export const projectSeeder: DeepPartial<Project>[] = [
  {
    id: 1,
    name: 'Mobile App Redesign',
    description: 'Complete overhaul of the mobile experience.',
    status: 'active',
    createdAt: new Date('2026-02-02'),
    users: [{ id: 1 }, { id: 2 }],
  },
  {
    id: 2,
    name: 'Customer Portal',
    description: 'Account and billing self-service.',
    status: 'active',
    createdAt: new Date('2026-03-18'),
    users: [{ id: 3 }],
  },
  {
    id: 3,
    name: 'Cloud Migration',
    description: 'Move the legacy infrastructure over.',
    status: 'at_risk',
    createdAt: new Date('2026-01-05'),
    users: [{ id: 3 }, { id: 2 }],
  },
  {
    id: 4,
    name: 'Loyalty Program',
    description: 'Points and rewards system.',
    status: 'completed',
    createdAt: new Date('2025-09-11'),
    users: [{ id: 1 }],
  },
];
