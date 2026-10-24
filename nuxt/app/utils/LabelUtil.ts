// Developed by Mateo Garcia Carreno

// Internal imports
import type { CalculatorOperator } from '@/types/CalculatorTypes';
import type { ProjectStatus } from '#shared/types/ProjectTypes';
import type { SprintStatus } from '#shared/types/SprintTypes';

export class LabelUtil {
  static readonly PROJECT_STATUS: Record<ProjectStatus, string> = {
    planning: 'Planned',
    active: 'Active',
    at_risk: 'At risk',
    paused: 'Paused',
    completed: 'Closed',
  };

  static readonly SPRINT_STATUS: Record<SprintStatus, string> = {
    planned: 'Planned',
    active: 'In progress',
    completed: 'Closed',
  };

  static readonly CALCULATOR_OPERATOR: Record<CalculatorOperator, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };
}
