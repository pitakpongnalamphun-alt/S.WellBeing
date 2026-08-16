import type { Metadata } from "next";
import Link from "next/link";
import {
  Bookmark,
  Book,
  CalendarCheck,
  ChevronRight,
  Cloud,
  Gift,
  type LucideIcon,
} from "lucide-react";

import { FluffyMascot } from "@/components/FluffyMascot";
import { StarBar } from "@/components/gacha/StarBar";
import { AccountActions } from "@/components/student/AccountActions";
import { MyProfileCard } from "@/components/student/MyProfileCard";

export const metadata: Metadata = { title: "ของฉัน — S.Well-Being" };

type Item = {
  href: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  badge: string;
};

/**
 * "Me" gathers everything that belongs to this student — rewards, the record of
 * how they've been feeling, the clouds and quotes they've kept, their bookings.
 * All of it is looked-back-on or owned, quarantined from the serious channels so
 * celebration never sits beside a crisis control.
 */
const ITEMS: Item[] = [
  {
    href: "/rewards",
    title: "แก๊งเพื่อนปุย",
    desc: "หมุนกาชา · แต่งตัว · สะสมเพื่อน",
    Icon: Gift,
    badge: "bg-amber-50 text-amber-600",
  },
  {
    href: "/mood?tab=book",
    title: "สมุดสะสมอารมณ์",
    desc: "ย้อนดูอารมณ์รายเดือน",
    Icon: Book,
    badge: "bg-orange-50 text-orange-600",
  },
  {
    href: "/galaxy",
    title: "ก้อนเมฆของฉัน",
    desc: "เมฆที่ปล่อยไป และกอดที่ส่งให้เพื่อน",
    Icon: Cloud,
    badge: "bg-sky-50 text-sky-600",
  },
  {
    href: "/wisdom",
    title: "คำคมที่บันทึกไว้",
    desc: "แง่คิดที่เธอเก็บไว้เติมใจ",
    Icon: Bookmark,
    badge: "bg-lavender-100 text-lavender-700",
  },
  {
    href: "/appointments",
    title: "นัดของฉัน",
    desc: "นัดพูดคุยที่กำลังจะถึง",
    Icon: CalendarCheck,
    badge: "bg-pink-50 text-pink-600",
  },
];

export default function MePage() {
  return (
    <div className="space-y-6 pb-24 pt-2">
      <header className="flex flex-col items-center gap-3 pt-2 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-lavender-50 ring-1 ring-lavender-200/70">
          <FluffyMascot size={64} floating={false} />
        </span>
        <h1 className="font-display th:leading-snug text-[1.35rem] font-bold text-ink">
          ของฉัน
        </h1>
        <StarBar />
      </header>

      <MyProfileCard />

      {/* รายการเมนูเรียงเป็นสองแถวบนแท็บเล็ต เห็นครบโดยไม่ต้องเลื่อน */}
      <ul className="space-y-2.5 ipad:grid ipad:grid-cols-2 ipad:gap-2.5 ipad:space-y-0">
        {ITEMS.map(({ href, title, desc, Icon, badge }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${badge}`}
              >
                <Icon className="size-[1.35rem]" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.92rem] font-bold text-ink">
                  {title}
                </span>
                <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-soft">
                  {desc}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-ink-mute"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* ท้ายสุดของหน้า ไม่ใช่ในรายการด้านบน — ปุ่มลบข้อมูลไม่ควรอยู่ปะปนกับปุ่ม
          "แก๊งเพื่อนปุย" ให้กดพลาดได้ */}
      <AccountActions />
    </div>
  );
}
