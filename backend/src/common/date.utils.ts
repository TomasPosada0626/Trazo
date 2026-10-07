// Developed by Mateo Garcia Carreno

export class DateUtils {
  private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  static startOfToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  static daysBetween(fromIso: string, toIso: string): number {
    const from = Date.parse(fromIso.slice(0, 10));
    const to = Date.parse(toIso.slice(0, 10));

    return Math.round((to - from) / DateUtils.MS_PER_DAY);
  }

  static isPastDate(iso: string): boolean {
    return DateUtils.daysBetween(DateUtils.startOfToday(), iso) < 0;
  }
}
