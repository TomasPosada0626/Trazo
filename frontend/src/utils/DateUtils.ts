// Author: Mateo Garcia Carreno

export class DateUtils {
  private static readonly MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  static formatDate(iso: string): string {
    const date = new Date(iso);

    // UTC getters, so a date-only string never shifts a day in a negative
    // timezone offset.
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${day} ${DateUtils.MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }

  static formatDayMonth(iso: string): string {
    const date = new Date(iso);
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${day} ${DateUtils.MONTHS[date.getUTCMonth()]}`;
  }

  static formatDateRange(startIso: string, endIso: string): string {
    return `${DateUtils.formatDayMonth(startIso)} – ${DateUtils.formatDayMonth(endIso)}`;
  }

  static startOfToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  static daysBetween(fromIso: string, toIso: string): number {
    // Both sides are truncated to their date part, so the result never depends
    // on the time of day a record was created.
    const from = Date.parse(fromIso.slice(0, 10));
    const to = Date.parse(toIso.slice(0, 10));

    return Math.round((to - from) / DateUtils.MS_PER_DAY);
  }

  static isPastDate(iso: string): boolean {
    return DateUtils.daysBetween(DateUtils.startOfToday(), iso) < 0;
  }
}
