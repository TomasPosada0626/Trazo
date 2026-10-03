// Author: Mateo Garcia Carreno

export class DateUtils {
  private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  static startOfToday(): string {
    // The UTC date, the same "today" the frontend's DateUtils uses, so the
    // server and the browser agree on which tasks are overdue.
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
