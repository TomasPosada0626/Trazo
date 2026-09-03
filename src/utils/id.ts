/**
 * Next id for a collection: one past the highest in use.
 *
 * Not `length + 1`, which collides the moment a record in the middle is
 * deleted. Reading the maximum survives gaps, and the ids stay small and
 * readable, which matters because they show up in the UI and in URLs.
 */
export function nextId(items: { id: number }[]): number {
  return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
}

/**
 * Renders an id as a short chip label, e.g. `PRJ-01`.
 *
 * Ids are plain integers; the prefix and padding exist only so a table cell
 * says which entity it belongs to at a glance.
 */
export function shortId(prefix: string, id: number): string {
  return `${prefix}-${String(id).padStart(2, '0')}`;
}
