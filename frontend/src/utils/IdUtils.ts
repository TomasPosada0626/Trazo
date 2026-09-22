// Author: Mateo Garcia Carreno

export class IdUtils {
  static nextId(items: { id: number }[]): number {
    // Not `length + 1`, which collides the moment a record in the middle is
    // deleted. Reading the maximum survives gaps and keeps ids small, which
    // matters because they show up in the UI and in URLs.
    return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
  }

  static shortId(prefix: string, id: number): string {
    // Display only: the stored id is the bare integer, and the prefix exists
    // so a table cell says which entity it belongs to at a glance.
    return `${prefix}-${String(id).padStart(2, '0')}`;
  }
}
