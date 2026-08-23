const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an ISO 8601 date as "02 Feb 2026".
 * Uses UTC getters so a date-only string never shifts a day in negative
 * timezone offsets.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Formats an ISO date without the year, as "05 Jan". */
export function formatDayMonth(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getUTCMonth()]}`;
}

/** Formats a sprint window as "05 Jan – 19 Jan". */
export function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDayMonth(startIso)} – ${formatDayMonth(endIso)}`;
}
