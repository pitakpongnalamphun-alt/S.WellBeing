"use client";

import { useEffect } from "react";

import { useAssessmentStore } from "@/lib/store/useAssessmentStore";
import { useMoodStatsStore } from "@/lib/store/useMoodStatsStore";

/**
 * ดึงสถิตินิรนาม (ผลประเมินใจ + อารมณ์ประจำวัน) มาลงแดชบอร์ดครู
 *
 * วางไว้ "เฉพาะฝั่งเจ้าหน้าที่" โดยตั้งใจ — สองตารางนี้ RLS ให้เฉพาะเจ้าหน้าที่อ่าน
 * ถ้าเผลอเอาไปวางฝั่งนักเรียนด้วย การดึงจะได้ 0 แถวแล้วไปทับสถิติในเครื่องทิ้ง
 * ส่วนขาส่งขึ้นนั้นเกิดตอนนักเรียนกดบันทึกอยู่แล้ว ไม่ต้องมีตัวซิงก์
 *
 * ไม่เรนเดอร์อะไรเลย เป็นแค่ตัวเชื่อมข้อมูล
 */
export function StatsSync() {
  const syncAssess = useAssessmentStore((s) => s.syncFromServer);
  const syncMood = useMoodStatsStore((s) => s.syncFromServer);

  useEffect(() => {
    const pull = () => {
      void syncAssess();
      void syncMood();
    };
    pull();

    const onFocus = () => {
      if (document.visibilityState === "visible") pull();
    };
    document.addEventListener("visibilitychange", onFocus);
    // สถิติรวมไม่ต้องสด ๆ ทุกวินาที — 5 นาทีพอ และประหยัดโควตาฝั่งฟรี
    const t = window.setInterval(pull, 300_000);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.clearInterval(t);
    };
  }, [syncAssess, syncMood]);

  return null;
}

export default StatsSync;
