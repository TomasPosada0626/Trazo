// Developed by Mateo Garcia Carreno
export const CALCULATOR_OPERATORS = ['+', '-', '*', '/'] as const;

export type CalculatorOperator = (typeof CALCULATOR_OPERATORS)[number];
