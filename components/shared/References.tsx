import type { Reference } from "@/data/copingGuides";

/**
 * แหล่งอ้างอิงท้ายเนื้อหา — ใช้หน้าตาเดียวกันทุกที่ในแอป
 *
 * ข้อกำหนด: ตัวเล็กกว่าเนื้อหา สีเทาอ่อน ไม่หนา ไม่ใช้สีฉูดฉาด และอยู่บรรทัดล่างสุด
 * ของบทเรียนเสมอ เพื่อไม่ให้รบกวนสายตาคนที่กำลังไม่ไหว
 *
 * ที่แยกออกมาเป็นคอมโพเนนต์กลาง เพราะตอนนี้มีสองที่ใช้แล้ว (คลังวิธีรับมือ กับ
 * ห้องฝึกหายใจ) ถ้าปล่อยให้ต่างคนต่างเขียน อีกหน้าจะหลุดกฎนี้ทีละนิดโดยไม่มีใครสังเกต
 *
 * ใช้โทเคนสี ink-mute ของโปรเจกต์แทนการฮาร์ดโค้ด #888888 เพราะสีตายตัวจะจมหายไป
 * บนพื้นเข้ม ส่วนโทเคนอ่านออกเท่ากันทั้งธีมสว่างและมืด
 */
export function References({
  items,
  className = "",
}: {
  items: Reference[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <p
      className={`text-[0.68rem] font-normal leading-relaxed text-ink-mute ${className}`.trim()}
    >
      *อ้างอิงข้อมูล:{" "}
      {items.map((r, i) => (
        <span key={r.label}>
          {i > 0 ? " · " : ""}
          {r.url ? (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2"
            >
              {r.label}
            </a>
          ) : (
            r.label
          )}
        </span>
      ))}
    </p>
  );
}
