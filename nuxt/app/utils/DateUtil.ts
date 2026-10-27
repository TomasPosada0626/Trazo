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
}
