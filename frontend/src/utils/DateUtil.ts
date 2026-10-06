// Developed by Mateo Garcia Carreno

export class DateUtil {
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

    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${day} ${DateUtil.MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }

  static formatDayMonth(iso: string): string {
    const date = new Date(iso);
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${day} ${DateUtil.MONTHS[date.getUTCMonth()]}`;
  }

  static formatDateRange(startIso: string, endIso: string): string {
    return `${DateUtil.formatDayMonth(startIso)} – ${DateUtil.formatDayMonth(endIso)}`;
  }

  static startOfToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  static daysBetween(fromIso: string, toIso: string): number {
    const from = Date.parse(fromIso.slice(0, 10));
    const to = Date.parse(toIso.slice(0, 10));

    return Math.round((to - from) / DateUtil.MS_PER_DAY);
  }

  static isPastDate(iso: string): boolean {
    return DateUtil.daysBetween(DateUtil.startOfToday(), iso) < 0;
  }
}
