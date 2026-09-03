import type { SprintInterface } from '@/interfaces/SprintInterface';

/**
 * Mock sprints preloaded on first load.
 *
 * `completedPoints` is absent on purpose: it is summed from the sprint's done
 * tasks by SprintService.getTotalCompletedPoints(), never stored.
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
    totalCommittedPoints: 20,
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-07',
    name: 'Onboarding v1',
    goal: 'First version of user sign-up.',
    startDate: '2026-01-20',
    endDate: '2026-02-03',
    status: 'completed',
    totalCommittedPoints: 14,
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-08',
    name: 'Onboarding v2',
    goal: 'Email verification and welcome.',
    startDate: '2026-02-04',
    endDate: '2026-02-18',
    status: 'active',
    totalCommittedPoints: 18,
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-09',
    name: 'Push notifications',
    goal: 'Real-time activity alerts.',
    startDate: '2026-02-19',
    endDate: '2026-03-05',
    status: 'planned',
    totalCommittedPoints: 8,
    projectId: 'PRJ-01',
  },
  {
    id: 'SPR-10',
    name: 'Billing screens',
    goal: 'Invoice list and payment detail.',
    startDate: '2026-01-12',
    endDate: '2026-01-26',
    status: 'completed',
    totalCommittedPoints: 15,
    projectId: 'PRJ-02',
  },
  {
    id: 'SPR-11',
    name: 'Fast checkout',
    goal: 'One-step checkout for returning customers.',
    startDate: '2026-02-09',
    endDate: '2026-02-23',
    status: 'active',
    totalCommittedPoints: 12,
    projectId: 'PRJ-02',
  },
  {
    id: 'SPR-12',
    name: 'Server inventory',
    goal: 'Catalogue everything still on-premise.',
    startDate: '2026-02-02',
    endDate: '2026-02-16',
    status: 'active',
    totalCommittedPoints: 14,
    projectId: 'PRJ-03',
  },
];
