import type { SprintInterface } from '@/interfaces/SprintInterface';

/**
 * Mock sprints preloaded on first load.
 *
 * Neither committed nor completed points are stored: both are summed from the
 * sprint's tasks by SprintService, so they can never disagree with the work
 * actually scheduled.
 *
 * PRJ-04 deliberately has no sprints, so the dashboard's range selector has a
 * project that exercises the "no sprints" state.
 */
export const sprintSeeder: SprintInterface[] = [
  {
    id: 'SPR-06',
    name: 'Flow design',
    goal: "Close out the app's main flows.",
    startDate: '2026-01-05',
    endDate: '2026-01-19',
    status: 'completed',
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-07',
    name: 'Onboarding v1',
    goal: 'First version of user sign-up.',
    startDate: '2026-01-20',
    endDate: '2026-02-03',
    status: 'completed',
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-08',
    name: 'Onboarding v2',
    goal: 'Email verification and welcome.',
    startDate: '2026-02-04',
    endDate: '2026-02-18',
    status: 'active',
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-09',
    name: 'Push notifications',
    goal: 'Real-time activity alerts.',
    startDate: '2026-02-19',
    endDate: '2026-03-05',
    status: 'planned',
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-10',
    name: 'Billing screens',
    goal: 'Invoice list and payment detail.',
    startDate: '2026-01-12',
    endDate: '2026-01-26',
    status: 'completed',
    projectId: 'PRJ-02',
  },
  {
    id: 'SPR-11',
    name: 'Fast checkout',
    goal: 'One-step checkout for returning customers.',
    startDate: '2026-02-09',
    endDate: '2026-02-23',
    status: 'active',
    projectId: 'PRJ-02',
  },
  {
    id: 'SPR-12',
    name: 'Server inventory',
    goal: 'Catalogue everything still on-premise.',
    startDate: '2026-02-02',
    endDate: '2026-02-16',
    status: 'active',
    projectId: 'PRJ-03',
  },
];
