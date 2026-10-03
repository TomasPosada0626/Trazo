// Author: Mateo Garcia Carreno

// external imports
import type { DeepPartial } from 'typeorm';

// internal imports
import type { Sprint } from '../sprints/entities/sprint.entity.js';

export const sprintSeeder: DeepPartial<Sprint>[] = [
  {
    id: 1,
    name: 'Flow design',
    goal: "Close out the app's main flows.",
    startDate: '2026-01-05',
    endDate: '2026-01-19',
    status: 'completed',
    project: { id: 1 },
  },
  {
    id: 2,
    name: 'Onboarding v1',
    goal: 'First version of user sign-up.',
    startDate: '2026-01-20',
    endDate: '2026-02-03',
    status: 'completed',
    project: { id: 1 },
  },
  {
    id: 3,
    name: 'Onboarding v2',
    goal: 'Email verification and welcome.',
    startDate: '2026-02-04',
    endDate: '2026-02-18',
    status: 'active',
    project: { id: 1 },
  },
  {
    id: 4,
    name: 'Push notifications',
    goal: 'Real-time activity alerts.',
    startDate: '2026-02-19',
    endDate: '2026-03-05',
    status: 'planned',
    project: { id: 1 },
  },
  {
    id: 5,
    name: 'Billing screens',
    goal: 'Invoice list and payment detail.',
    startDate: '2026-01-12',
    endDate: '2026-01-26',
    status: 'completed',
    project: { id: 2 },
  },
  {
    id: 6,
    name: 'Fast checkout',
    goal: 'One-step checkout for returning customers.',
    startDate: '2026-02-09',
    endDate: '2026-02-23',
    status: 'active',
    project: { id: 2 },
  },
  {
    id: 7,
    name: 'Server inventory',
    goal: 'Catalogue everything still on-premise.',
    startDate: '2026-02-02',
    endDate: '2026-02-16',
    status: 'active',
    project: { id: 3 },
  },
];
