"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Flame, Sparkles } from "lucide-react";

import { CoinBalance } from "@/components/student/CoinBalance";
import { GachaButton } from "@/components/student/GachaButton";
import { localDay, localDayBefore } from "@/lib/date";
import { useGachaStore } from "@/lib/store/useGachaStore";
import { useMoodDiaryStore } from "@/lib/store/useMoodDiaryStore";

/**
 * หัวหน้าแรก — ทักทาย · วันที่ · ความต่อเนื่องในการดูแลใจ
 *
 * เดิมมีแค่ "ยินดีต้อนรับ" กับ "วันนี้เป็นยังไงบ้าง" แล้วเว้นว่าง ทั้งที่ตรงนี้คือที่แรก
 * ที่สายตาไปถึง และเป็นที่ที่ควรบอกว่า "ที่ผ่านมาเธอทำอะไรไว้บ้าง" ก่อนจะถามว่าวันนี้
 * เป็นยังไง
 *
 * เรื่องสตรีค — จุดที่ต้องระวังที่สุดในไฟล์นี้
 *
 * สตรีคเป็นดาบสองคมในแอปสุขภาพจิต วันที่เด็กไม่ไหวจนไม่ได้เปิดแอป คือวันที่สตรีคขาด
 * พอดี ถ้าหน้าจอทวงว่า "สตรีคขาดแล้ว" หรือโชว์เลข 0 ตัวโต ๆ มันจะเติมความรู้สึกผิด
 * ให้คนที่แบกไม่ไหวอยู่แล้ว จึงมีกติกาสองข้อ
 *
 *   1. สตรีคที่ขาดแล้วจะไม่ถูกพูดถึงเลย ไม่มีคำว่าขาด ไม่มีเลข 0 ไม่มีสีเตือน
 *      แต่เปลี่ยนไปนับ "เดือนนี้ดูแลใจไปแล้วกี่วัน" แทน ซึ่งเป็นตัวเลขที่ไม่มีวันลดลง
 *   2. ไม่มีการทวงให้กลับมาเช็คอิน มีแต่การบอกว่าที่ทำไปแล้วมีอยู่จริง
 *
 * และสตรีคต้องคำนวณจาก lastCheckIn ทุกครั้ง ไม่ใช่อ่าน streak ในสโตร์มาแสดงตรง ๆ
 * เพราะสโตร์เก็บเลขเดิมค้างไว้จนกว่าจะมีการเช็คอินครั้งถัดไป คนที่หายไปสองสัปดาห์
 * เปิดแอปมาจะเห็น "ต่อเนื่อง 5 วัน" ทั้งที่ขาดไปนานแล้ว
 */

const WEEKDAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function thaiDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}ที่ ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function HomeHeader() {
  const streak = useGachaStore((s) => s.streak);
  const lastCheckIn = useGachaStore((s) => s.lastCheckIn);
  const entries = useMoodDiaryStore((s) => s.entries);

  // สโตร์ rehydrate หลัง mount — เรนเดอร์ค่าจริงตั้งแต่รอบแรกจะทำให้ HTML ไม่ตรงกัน
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const today = localDay();
  // สตรีคยังนับว่า "ยังไม่ขาด" ก็ต่อเมื่อเช็คอินล่าสุดคือวันนี้หรือเมื่อวาน
  const liveStreak =
    mounted && (lastCheckIn === today || lastCheckIn === localDayBefore())
      ? streak
      : 0;
  const checkedInToday = mounted && lastCheckIn === today;

  // จำนวนวันที่บันทึกอารมณ์ในเดือนนี้ — ตัวเลขที่มีแต่เพิ่ม ไม่มีลด
  const monthPrefix = today.slice(0, 7);
  const daysThisMonth = mounted
    ? new Set(entries.filter((e) => e.day?.startsWith(monthPrefix)).map((e) => e.day)).size
    : 0;

  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* ทักทายแบบไม่เอ่ยชื่อ — ชื่อที่เก็บไว้เป็นชื่อจริงเต็ม ๆ และหน้าแรกคือหน้าที่
              เด็กเปิดตอนนั่งอยู่กับเพื่อน ด้วยเหตุผลเดียวกับที่บัตรของฉันปิดชื่อไว้ */}
          <p className="text-[0.82rem] font-medium text-ink-soft">สวัสดี 👋</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[0.76rem] text-ink-mute">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {/* วันที่เรนเดอร์ฝั่งไคลเอนต์เท่านั้น เพราะเซิร์ฟเวอร์อยู่คนละโซนเวลากับเครื่องเด็ก */}
            {mounted ? thaiDate(new Date()) : " "}
          </p>
          <h1 className="font-display th:leading-snug mt-0.5 text-[1.45rem] font-bold text-ink">
            วันนี้เป็นยังไงบ้าง
          </h1>
        </div>
        <span className="flex shrink-0 items-center gap-2">
          <GachaButton />
          <CoinBalance />
        </span>
      </div>

      {/* แถบความต่อเนื่อง — เล่าสิ่งที่ทำไปแล้ว ไม่ทวงสิ่งที่ยังไม่ได้ทำ */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-2xl bg-panel/50 px-3.5 py-2.5">
        {liveStreak > 0 ? (
          <>
            <span className="flex items-center gap-1.5 text-[0.84rem] font-bold text-ink">
              <Flame className="size-4 text-amber-500" aria-hidden="true" />
              ดูแลใจต่อเนื่อง {liveStreak} วัน
            </span>
            <span className="text-[0.78rem] text-ink-soft">
              {checkedInToday ? "วันนี้บันทึกแล้ว เก่งมาก" : "วันนี้ยังบันทึกได้อยู่นะ"}
            </span>
          </>
        ) : daysThisMonth > 0 ? (
          <span className="flex items-center gap-1.5 text-[0.84rem] font-medium text-ink">
            <Sparkles className="size-4 text-lavender-500" aria-hidden="true" />
            เดือนนี้เธอดูแลใจตัวเองไปแล้ว{" "}
            <span className="font-bold">{daysThisMonth} วัน</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[0.82rem] text-ink-soft">
            <Sparkles className="size-4 text-lavender-400" aria-hidden="true" />
            เริ่มวันนี้ก็ได้ ไม่ต้องเริ่มให้สวย
          </span>
        )}
      </div>
    </header>
  );
}
