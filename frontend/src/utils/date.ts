// Author: Mateo Garcia Carreno

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an ISO 8601 date as "02 Feb 2026".
 * Uses UTC getters so a date-only string never shifts a day in negative
 * timezone offsets.
 *
 * @param iso ISO 8601 date string.
 * @returns The formatted date.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Formats an ISO date without the year, as "05 Jan".
 *
 * @param iso ISO 8601 date string.
 * @returns The formatted day and month.
 */
export function formatDayMonth(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getUTCMonth()]}`;
}

/**
 * Formats a sprint window as "05 Jan – 19 Jan".
 *
 * @param startIso ISO 8601 start date.
 * @param endIso ISO 8601 end date.
 * @returns The formatted date range.
 */
export function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDayMonth(startIso)} – ${formatDayMonth(endIso)}`;
}

/** @returns Today at UTC midnight, as an ISO date string — the baseline for day maths. */
export function startOfToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Whole days from one ISO date to another; negative when `to` is in the past.
 * Both sides are truncated to their date part, so the result never depends on
 * the time of day a task was created.
 *
 * @param fromIso ISO 8601 date to measure from.
 * @param toIso ISO 8601 date to measure to.
 * @returns Whole days between the two dates.
 */
export function daysBetween(fromIso: string, toIso: string): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const from = Date.parse(fromIso.slice(0, 10));
  const to = Date.parse(toIso.slice(0, 10));

  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Checks whether the date is in the past.
 *
 * @param iso ISO 8601 date string.
 * @returns `true` when the date is strictly before today.
 */
export function isPastDate(iso: string): boolean {
  return daysBetween(startOfToday(), iso) < 0;
}
