// Developed by Mateo Garcia Carreno

export class IdUtil {
  static shortId(prefix: string, id: number): string {
    return `${prefix}-${String(id).padStart(2, '0')}`;
  }
}
