"use client";

import Link from "next/link";
import {
  CalendarHeart,
  ClipboardCheck,
  Gamepad2,
  MessageCircleHeart,
  ShieldAlert,
  SmilePlus,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Feature = {
  href: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  /** Pastel icon-badge classes — the one spot of colour per tile. */
  badge: string;
};

/**
 * The six everyday features, each on its own hue so the grid reads as six
 * distinct doors rather than a wall of one colour. SOS is not here — an
 * emergency control does not belong in a grid where a mis-tap sends it; it
 * gets its own button below.
 */
const FEATURES: Feature[] = [
  {
    href: "/report",
    title: "แจ้งเหตุ",
    // Not "ไม่ระบุตัวตน" — anonymity isn't built yet, and the report page
    // itself has to decide what it means. Don't promise it on the tile.
    desc: "บอกเล่าให้ครูแนะแนว",
    Icon: ShieldAlert,
    badge: "bg-red-50 text-red-600",
  },
  {
    href: "/chatbot",
    title: "Well.AI",
    // "ผู้ช่วยพูดคุย", not "ที่ปรึกษา" — it's an AI, and calling it a
    // counsellor sets an expectation the page then has to walk back.
    desc: "ผู้ช่วยพูดคุยส่วนตัว",
    Icon: MessageCircleHeart,
    badge: "bg-purple-50 text-purple-700",
  },
  {
    href: "/assessment",
    title: "ประเมินใจ",
    desc: "เช็คสุขภาพจิตสั้น ๆ",
    Icon: ClipboardCheck,
    badge: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/games",
    title: "ฝึกทักษะ",
    desc: "เกมจำลองสถานการณ์",
    Icon: Gamepad2,
    badge: "bg-blue-50 text-blue-600",
  },
  {
    href: "/breathing",
    title: "เพื่อนหายใจ",
    desc: "ผ่อนคลายความเครียด",
    Icon: Wind,
    badge: "bg-teal-50 text-teal-600",
  },
  {
    href: "/mood",
    title: "บันทึกอารมณ์",
    desc: "วงล้อความรู้สึก",
    Icon: SmilePlus,
    badge: "bg-orange-50 text-orange-600",
  },
  {
    href: "/appointments",
    title: "นัดพูดคุย",
    desc: "จองเวลากับครู/นักจิตวิทยา",
    Icon: CalendarHeart,
    badge: "bg-pink-50 text-pink-600",
  },
];

export function FeatureGrid() {
  return (
    <ul className="grid grid-cols-2 gap-3.5">
      {FEATURES.map(({ href, title, desc, Icon, badge }) => (
        <li key={href}>
          <Link
            href={href}
            className={cn(
              "flex h-full flex-col items-start gap-3 rounded-2xl bg-white p-4",
              "shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
            )}
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-xl",
                badge,
              )}
            >
              <Icon className="size-6" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="mt-auto text-left">
              <span className="block text-[0.92rem] font-bold text-ink">
                {title}
              </span>
              <span className="mt-0.5 block text-[0.72rem] leading-snug text-ink-soft">
                {desc}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
