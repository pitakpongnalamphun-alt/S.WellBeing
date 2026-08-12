import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageCircleHeart, SmilePlus, Wind } from "lucide-react";

import { CoinBalance } from "@/components/student/CoinBalance";
import { FluffyMascot } from "@/components/FluffyMascot";
import { GachaButton } from "@/components/student/GachaButton";
import { MyAssessProgress } from "@/components/student/MyAssessProgress";
import { SosLauncher } from "@/components/student/SosLauncher";
import { HomeGarden } from "@/components/gacha/HomeGarden";
import { WisdomStrip } from "@/components/WisdomStrip";

export const metadata: Metadata = { title: "หน้าหลัก — S.Well-Being" };

export default function StudentDashboardPage() {
  return (
    // pb clears the small SOS pill + raised แจ้งเหตุ button + tab bar so the
    // last card isn't hidden behind them at the bottom of the scroll.
    <div className="space-y-6 pb-32 pt-2">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.78rem] text-ink-mute">ยินดีต้อนรับ 👋</p>
          <h1 className="font-display th:leading-snug text-[1.45rem] font-bold text-ink">
            วันนี้เป็นยังไงบ้าง
          </h1>
        </div>
        <span className="flex shrink-0 items-center gap-2">
          <GachaButton />
          <CoinBalance />
        </span>
      </header>

      {/* Hero — แจ้งเหตุ. The thing this app is really for, fronted warmly by
          น้องปุย so reaching out feels safe, not alarming. Never rewarded: the
          coin economy stays with self-care, not with reporting distress. */}
      <Link
        href="/report"
        className="block rounded-[1.6rem] p-4 shadow-[0_16px_36px_-22px_rgba(200,74,31,0.5)] ring-1 ring-[#f0997b] transition hover:-translate-y-0.5 active:translate-y-0"
        style={{ background: "#fbe6dd" }}
      >
        <div className="flex items-center gap-3.5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white">
            <FluffyMascot size={54} floating={false} />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block text-[1.05rem] font-bold leading-snug"
              style={{ color: "#7a2c12" }}
            >
              วันนี้มีเรื่องไม่สบายใจไหม?
            </span>
            <span
              className="mt-0.5 block text-[0.78rem] leading-snug"
              style={{ color: "#93381b" }}
            >
              บอกน้องปุยได้เลย ปลอดภัย · ไม่ต้องบอกชื่อก็ได้
            </span>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-[0.7rem] font-bold text-white"
            style={{ background: "#b8431d" }}
          >
            🆘 ด่วน ติดต่อเลย
          </span>
          <span
            className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold"
            style={{ color: "#8f3819" }}
          >
            ⏳ ค่อย ๆ เตรียม
          </span>
          <span
            className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold"
            style={{ color: "#8f3819" }}
          >
            🔒 ไม่ระบุตัวตน
          </span>
        </div>
      </Link>

      {/* Daily self-care — the rewarded ritual, kept present but secondary. */}
      <section>
        <h2 className="mb-3 text-[0.95rem] font-bold text-ink">
          ดูแลใจตัวเองวันนี้
        </h2>
        <div className="grid grid-cols-2 gap-3.5">
          <Link
            href="/mood"
            className="flex h-full flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <SmilePlus className="size-6" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="mt-auto text-left">
              <span className="block text-[0.92rem] font-bold text-ink">
                วันนี้รู้สึกยังไง?
              </span>
              <span className="mt-0.5 block text-[0.72rem] leading-snug text-ink-soft">
                วงล้ออารมณ์ · ได้เหรียญ
              </span>
            </span>
          </Link>

          <Link
            href="/breathing"
            className="flex h-full flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Wind className="size-6" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="mt-auto text-left">
              <span className="block text-[0.92rem] font-bold text-ink">
                หายใจ 1 นาที
              </span>
              <span className="mt-0.5 block text-[0.72rem] leading-snug text-ink-soft">
                ผ่อนคลายความเครียด
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* พัฒนาการใจของฉัน — กราฟก่อน-หลังจากประวัติประเมินส่วนตัว (อยู่แค่เครื่องนี้) */}
      <MyAssessProgress />

      {/* A warm, standing invitation to น้องปุย — a gentle middle rung for a
          student who's feeling off but isn't in crisis. Kept softer than the
          แจ้งเหตุ hero: talking it out shouldn't feel like filing a report. */}
      <Link
        href="/chatbot"
        className="block rounded-2xl bg-lavender-50 p-4 ring-1 ring-lavender-200/70 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      >
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white">
            <MessageCircleHeart
              className="size-6 text-lavender-500"
              aria-hidden="true"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.95rem] font-bold text-ink">
              ไม่สบายใจอยู่หรือเปล่า?
            </span>
            <span className="mt-0.5 block text-[0.76rem] leading-snug text-ink-soft">
              มาคุยกับน้องปุยนะ ผู้ช่วย AI ที่พร้อมรับฟังเสมอ
            </span>
          </span>
          <ChevronRight
            className="size-5 shrink-0 text-lavender-400"
            aria-hidden="true"
          />
        </div>
      </Link>

      <HomeGarden />

      <WisdomStrip />

      {/* The classic always-visible SOS, back by request — floats above the tab
          bar (and clears the raised แจ้งเหตุ button). */}
      <SosLauncher />
    </div>
  );
}
