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

/** คีย์เดือนแบบ `YYYY-MM` ตามปฏิทินท้องถิ่น */
export function monthKey(d: Date = new Date()): string {
  return localDay(d).slice(0, 7);
}

/** เลื่อนคีย์เดือนไปข้างหน้า/ถอยหลัง (ข้ามปีให้เอง) */
export function shiftMonth(key: string, by: number): string {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + by, 1));
}

/** จำนวนวันของเดือนนั้น (ก.พ. ปีอธิกสุรทินได้ 29 อัตโนมัติ) */
export function daysInMonth(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/**
 * ชื่อเดือนภาษาไทย — th-TH ให้ปีพุทธศักราชมาเอง ซึ่งเป็นสิ่งที่ครูอ่านแล้วเข้าใจทันที
 * (`long` = "สิงหาคม 2569", ไม่ใส่ = "ส.ค. 69")
 */
export function monthLabel(key: string, long = false): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("th-TH", {
    month: long ? "long" : "short",
    year: long ? "numeric" : "2-digit",
  });
}
