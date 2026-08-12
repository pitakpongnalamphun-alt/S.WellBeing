"use client";

import { useEffect } from "react";

import { useAssessmentStore } from "@/lib/store/useAssessmentStore";
import { useMoodStatsStore } from "@/lib/store/useMoodStatsStore";

/**
 * ส่งสถิตินิรนามที่ค้างคิวขึ้นเซิร์ฟเวอร์ซ้ำ (ขาส่งอย่างเดียว ไม่มีการดึงลง)
 *
 * เวลานักเรียนบันทึกอารมณ์หรือทำแบบประเมินตอนเน็ตหลุด — หรือตอนที่ยังไม่ได้ล็อกอิน
 * ด้วย Google ซึ่ง RLS จะปฏิเสธ — จุดข้อมูลนั้นจะค้างอยู่ในเครื่อง ตัวนี้คอยส่งซ้ำให้
 * ตอนเปิดแอปครั้งถัดไปและตอนกลับมาที่แท็บ ไม่งั้นความรู้สึกของวันนั้นจะหายจากสถิติ
 * โรงเรียนถาวร (และเพราะกันบันทึกวันละครั้ง นักเรียนจะกดซ้ำเองก็ไม่ได้)
 *
 * คู่กับ StatsSync ฝั่งแอดมินที่ทำหน้าที่ตรงข้าม คือดึงลงมาแสดงผลอย่างเดียว
 */
export function StatsPush() {
  const flushMood = useMoodStatsStore((s) => s.flushPending);
  const flushAssess = useAssessmentStore((s) => s.flushPending);

  useEffect(() => {
    const push = () => {
      void flushMood();
      void flushAssess();
    };
    push();

    const onFocus = () => {
      if (document.visibilityState === "visible") push();
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [flushMood, flushAssess]);

  return null;
}

export default StatsPush;
