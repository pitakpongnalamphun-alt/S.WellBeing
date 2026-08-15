import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Gamepad2, SmilePlus, Wind } from "lucide-react";

import { FluffyMascot } from "@/components/FluffyMascot";
import { HomeHeader } from "@/components/student/HomeHeader";
import { MyAssessProgress } from "@/components/student/MyAssessProgress";
import { PuyInvite } from "@/components/student/PuyInvite";
import { SosLauncher } from "@/components/student/SosLauncher";
import { HomeGarden } from "@/components/gacha/HomeGarden";
import { WisdomStrip } from "@/components/WisdomStrip";

export const metadata: Metadata = { title: "หน้าหลัก — S.Well-Being" };

export default function StudentDashboardPage() {
  return (
    // pb clears the small SOS pill + raised แจ้งเหตุ button + tab bar so the
    // last card isn't hidden behind them at the bottom of the scroll.
    <div className="space-y-6 pb-32 pt-2">
      <HomeHeader />

      {/* Hero — แจ้งเหตุ. The thing this app is really for, fronted warmly by
          น้องปุย so reaching out feels safe, not alarming. Never rewarded: the
          coin economy stays with self-care, not with reporting distress. */}
      <Link
        href="/report"
        className="block rounded-[1.75rem] p-5 shadow-[0_18px_40px_-22px_rgba(200,74,31,0.55)] ring-1 ring-[#f0997b] transition hover:-translate-y-0.5 active:translate-y-0"
        style={{ background: "#fbe6dd" }}
      >
        <div className="flex items-center gap-3.5">
          <span className="flex size-[4.75rem] shrink-0 items-center justify-center rounded-full bg-white">
            <FluffyMascot size={66} floating={false} />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block text-[1.2rem] font-bold leading-snug"
              style={{ color: "#7a2c12" }}
            >
              วันนี้มีเรื่องไม่สบายใจไหม?
            </span>
            <span
              className="mt-1 block text-[0.82rem] leading-snug"
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

      {/* พระรอง — ประตูของ "วันธรรมดา" ที่ยังไม่ถึงขั้นต้องแจ้งครู
          อยู่ใต้ hero ทันที เพราะลำดับการเลื่อนคือลำดับความสำคัญ */}
      <PuyInvite />

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

          {/*
            ฝึกทักษะ — กินเต็มแถวที่สอง ไม่ใช่ครึ่งเดียว

            ที่ไม่เติมไทล์ที่สี่ให้ครบ 2×2 เพราะสองอย่างที่พอจะใส่ได้ต่างก็มีปุ่มของตัวเอง
            อยู่ห่างจากตรงนี้ไม่ถึงหนึ่งหน้าจอแล้ว — "คุยกับน้องอุ่น" มีการ์ดสีม่วงของ
            ตัวเองอยู่ใต้ลงไป และ "ประเมินใจ" ถูกลิงก์จากการ์ดพัฒนาการใจสองที่
            การวางปุ่มซ้ำห่างกันร้อยพิกเซล ทำให้คนสงสัยว่าสองปุ่มนี้ต่างกันตรงไหน
          */}
          <Link
            href="/games"
            className="col-span-2 flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Gamepad2 className="size-6" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[0.92rem] font-bold text-ink">
                ฝึกทักษะ
              </span>
              <span className="mt-0.5 block text-[0.72rem] leading-snug text-ink-soft">
                เกมจำลองสถานการณ์ 36 ด่าน · เล่นจบได้เหรียญ
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink-mute" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* พัฒนาการใจของฉัน — กราฟก่อน-หลังจากประวัติประเมินส่วนตัว (อยู่แค่เครื่องนี้) */}
      <MyAssessProgress />


      <HomeGarden />

      <WisdomStrip />

      {/* The classic always-visible SOS, back by request — floats above the tab
          bar (and clears the raised แจ้งเหตุ button). */}
      <SosLauncher />
    </div>
  );
}
