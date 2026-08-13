"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { BoxBreathing } from "@/components/BoxBreathing";
import { REWARDS, useGachaStore } from "@/lib/store/useGachaStore";
import { localDay } from "@/lib/date";

export default function BreathingPage() {
  return (
    <div className="flex flex-1 flex-col justify-center py-2">
      {/* useSearchParams ต้องอยู่ใต้ Suspense ไม่งั้นทั้งหน้าถูกบังคับให้เรนเดอร์ฝั่งไคลเอนต์ */}
      <Suspense fallback={null}>
        <BreathingRoom />
      </Suspense>
    </div>
  );
}

function BreathingRoom() {
  const earn = useGachaStore((s) => s.earn);
  // ?p=478 / ?p=sigh — การ์ดในคลังวิธีรับมือลิงก์ตรงมาที่ท่าที่มันพูดถึง แทนที่จะ
  // โยนมาหน้าเปล่าแล้วให้เด็กหาเองว่าท่าไหนคือท่าที่เพิ่งอ่านมา
  const initialPatternId = useSearchParams().get("p") ?? undefined;

  // Reward a completed session — the store dedupes on this key, so it pays out
  // once per day at most.
  const handleSessionComplete = useCallback(() => {
    earn(REWARDS.breathingSession, `breathing:${localDay()}`);
  }, [earn]);

  return (
    <BoxBreathing
      initialPatternId={initialPatternId}
      onSessionComplete={handleSessionComplete}
    />
  );
}
