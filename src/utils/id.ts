/**
 * Renders an id as a short chip label.
 *
 * Seeded records carry readable codes (PRJ-01) while records created at
 * runtime get a crypto.randomUUID(), which is far too long for a table cell.
 * This keeps both looking alike.
 */
export function shortId(prefix: string, id: string): string {
  if (/^[A-Z]{3,4}-\d+$/.test(id)) return id;

  return `${prefix}-${id.slice(0, 4).toUpperCase()}`;
}
