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
    id: 'PRJ-01',
    name: 'Rediseño App Móvil',
    description: 'Renovación completa de la experiencia móvil.',
    status: 'active',
    createdAt: '2026-02-02',
    memberIds: ['USR-01', 'USR-02'],
  },
  {
    id: 'PRJ-02',
    name: 'Portal de Clientes',
    description: 'Autogestión de cuentas y facturación.',
    status: 'active',
    createdAt: '2026-03-18',
    memberIds: ['USR-03'],
  },
  {
    id: 'PRJ-03',
    name: 'Migración a Cloud',
    description: 'Traslado de la infraestructura heredada.',
    status: 'at_risk',
    createdAt: '2026-01-05',
    memberIds: ['USR-03', 'USR-02'],
  },
  {
    id: 'PRJ-04',
    name: 'Programa de Fidelización',
    description: 'Sistema de puntos y recompensas.',
    status: 'completed',
    createdAt: '2025-09-11',
    memberIds: ['USR-01'],
  },
];
