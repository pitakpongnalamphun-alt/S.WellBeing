/**
 * Local calendar-date helpers.
 *
 * The app is used in Thailand (UTC+7). `toISOString()` gives the UTC date, whose
 * boundary falls at 07:00 local — so a "day" keyed off it rolls over mid-morning,
 * which breaks streaks and lets daily rewards be earned twice around the seam.
 * These helpers key off the user's LOCAL midnight instead.
 */

/** Today's local date as `YYYY-MM-DD`. */
export function localDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The local date one calendar day before `d` (handles month/year rollover). */
export function localDayBefore(d: Date = new Date()): string {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  return localDay(prev);
}
