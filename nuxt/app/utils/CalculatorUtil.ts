// Developed by Mateo Garcia Carreno

// Internal imports
import { CALCULATOR_OPERATORS, type CalculatorOperator } from '@/types/CalculatorTypes';

export class CalculatorUtil {
  static readonly ERROR = 'Error';

  private static readonly MAX_LENGTH = 15;

  private static readonly PRECISION = 12;

  private static readonly OPERATIONS: Record<
    CalculatorOperator,
    (left: number, right: number) => number
  > = {
    '+': (left, right) => left + right,
    '-': (left, right) => left - right,
    '*': (left, right) => left * right,
    '/': (left, right) => left / right,
  };

  static isOperator(key: string): key is CalculatorOperator {
    return (CALCULATOR_OPERATORS as readonly string[]).includes(key);
  }

  static appendDigit(display: string, digit: string): string {
    if (display.length >= CalculatorUtil.MAX_LENGTH) {
      return display;
    }

    return display === '0' ? digit : display + digit;
  }

  static appendDecimal(display: string): string {
    return display.includes('.') ? display : `${display}.`;
  }

  static removeLast(display: string): string {
    const shortened = display.slice(0, -1);

    return shortened === '' || shortened === '-' ? '0' : shortened;
  }

  static calculate(left: number, right: number, operator: CalculatorOperator): string {
    const result = CalculatorUtil.OPERATIONS[operator](left, right);
    if (!Number.isFinite(result)) {
      return CalculatorUtil.ERROR;
    }

    return String(Number(result.toPrecision(CalculatorUtil.PRECISION)));
  }
}
