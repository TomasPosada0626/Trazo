// Author: Mateo Garcia Carreno

export class IdUtils {
  static shortId(prefix: string, id: number): string {
    // Display only: the stored id is the bare integer, and the prefix exists
    // so a table cell says which entity it belongs to at a glance.
    return `${prefix}-${String(id).padStart(2, '0')}`;
  }
}
