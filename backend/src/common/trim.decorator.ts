// Author: Mateo Garcia Carreno

// external imports
import { Transform } from 'class-transformer';

export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
