import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarHeart,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  Compass,
  Gamepad2,
  MessageCircleHeart,
  Quote,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = { title: "สำรวจ — S.Well-Being" };

type Item = {
  href: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  badge: string;
};

type Section = { heading: string; note?: string; items: Item[] };

/**
 * The tools a student reaches for when a specific need arises — grouped into
 * four labelled shelves so it reads as "here's how I can get help / grow",
 * not a junk drawer. The human + AI help channels sit first, on purpose, so a
 * student who needs a person finds one without scrolling. (แจ้งเหตุ isn't here —
 * it's the app-wide hero button in the bar.)
 */
const SECTIONS: Section[] = [
  {
    heading: "คุยกับใครสักคน",
    note: "อยากระบายหรือปรึกษา เริ่มตรงนี้ได้เลย",
    items: [
      {
        href: "/chatbot",
        title: "คุยกับน้องปุย",
        desc: "ผู้ช่วยพูดคุย AI ส่วนตัว ทักได้ทุกเมื่อ",
        Icon: MessageCircleHeart,
        badge: "bg-purple-50 text-purple-700",
      },
      {
        href: "/appointments",
        title: "นัดพูดคุย",
        desc: "จองเวลากับครูแนะแนว / นักจิตวิทยา",
        Icon: CalendarHeart,
        badge: "bg-pink-50 text-pink-600",
      },
    ],
  },
  {
    heading: "ฝึกใจ",
    items: [
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
    ],
  },
  {
    heading: "ชุมชน",
    items: [
      {
        href: "/galaxy",
        title: "กาแล็กซีกอด",
        desc: "ส่งกอดให้เพื่อน ๆ ที่กำลังเหนื่อย",
        Icon: Cloud,
        badge: "bg-sky-50 text-sky-600",
      },
    ],
  },
  {
    heading: "เติมใจ",
    items: [
      {
        href: "/wisdom",
        title: "แง่คิดเติมใจ",
        desc: "คำคมและปรัชญาจากนักจิตวิทยา",
        Icon: Quote,
        badge: "bg-amber-50 text-amber-700",
      },
    ],
  },
];

export default function ExplorePage() {
  return (
    // แต่ละหมวดเป็นรายการที่แยกจากกัน วางข้างกันได้โดยไม่เสียลำดับการอ่าน
    <div className="space-y-6 pb-24 pt-2 ipad:grid ipad:grid-cols-2 ipad:items-start ipad:gap-x-6 ipad:gap-y-5 ipad:space-y-0">
      <header className="flex items-center gap-2 ipad:col-span-2">
        <Compass className="size-6 text-mint-600" aria-hidden="true" />
        <h1 className="font-display th:leading-snug text-[1.45rem] font-bold text-ink">
          สำรวจ
        </h1>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.heading}>
          <h2 className="text-[0.95rem] font-bold text-ink">{section.heading}</h2>
          {section.note ? (
            <p className="mt-0.5 text-[0.76rem] text-ink-soft">{section.note}</p>
          ) : null}
          <ul className="mt-3 space-y-2.5">
            {section.items.map(({ href, title, desc, Icon, badge }) => (
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
        </section>
      ))}
    </div>
  );
}
