import type { ProjectInterface } from '@/interfaces/ProjectInterface';

/**
 * Mock projects preloaded on first load, per the MVP's LocalStorage-only scope.
 * `progress` is absent on purpose: it is derived by
 * ProjectService.getOverallProgress(project), never stored.
 *
 * Every project needs at least one *admin* member. Only admins can open the
 * projects screen, and only for projects they belong to, so a project whose
 * members are all plain members is unreachable by everyone. Members still
 * appear in memberIds: that roster is the pool a task can be assigned to.
 */
export const projectSeeder: ProjectInterface[] = [
  {
    id: 1,
    name: 'Mobile App Redesign',
    description: 'Complete overhaul of the mobile experience.',
    status: 'active',
    createdAt: '2026-02-02',
    memberIds: [1, 2],
  },
  {
    id: 2,
    name: 'Customer Portal',
    description: 'Account and billing self-service.',
    status: 'active',
    createdAt: '2026-03-18',
    memberIds: [3],
  },
  {
    id: 3,
    name: 'Cloud Migration',
    description: 'Move the legacy infrastructure over.',
    status: 'at_risk',
    createdAt: '2026-01-05',
    memberIds: [3, 2],
  },
  {
    id: 4,
    name: 'Loyalty Program',
    description: 'Points and rewards system.',
    status: 'completed',
    createdAt: '2025-09-11',
    memberIds: [1],
  },
];
