"use client";

import { useCallback } from "react";

import {
  MentalHealthAssessment,
  type AssessOutcome,
} from "@/components/MentalHealthAssessment";
import { REWARDS, useGachaStore } from "@/lib/store/useGachaStore";
import {
  useAssessmentStore,
  type AssessAction,
} from "@/lib/store/useAssessmentStore";
import { useMyAssessStore } from "@/lib/store/useMyAssessStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { localDay } from "@/lib/date";

export default function AssessmentPage() {
  const earn = useGachaStore((s) => s.earn);
  const record = useAssessmentStore((s) => s.record);
  const remember = useMyAssessStore((s) => s.remember);

  // Finishing a self-check rewards the courage to understand your own feelings —
  // but never on an emergency result: we don't put a coin celebration next to a
  // crisis alert.
  const handleComplete = useCallback(
    (result: AssessOutcome & { steps: AssessOutcome[] }) => {
      // Log the anonymised result for school-wide statistics FIRST — every
      // session counts, including the crisis ones (which matter most to see).
      //
      // จุดเดียวต่อการทำหนึ่งรอบ ติดป้ายด้วย "ระดับหนักสุด" ตลอดเส้นทาง — ถ้าบันทึก
      // ทุกแบบที่ทำ ตัวเลขรวมของโรงเรียนจะเฟ้อตามจำนวนแบบที่เส้นทางพาไป
      record({
        assessmentId: result.assessmentId,
        score: result.score,
        action: result.action as AssessAction,
      });
      // ประวัติส่วนตัว (อยู่แค่ในเครื่องนักเรียน ผูกกับ studentId ของคนที่ล็อกอิน)
      // — ไว้ดูพัฒนาการก่อน-หลังของตัวเอง
      //
      // เก็บ "ทุกแบบ" ที่ทำจบ ไม่ใช่แค่ผลหนักสุด: ทำ PHQ-A แล้วต่อ 8Q ต้องเห็นกราฟ
      // ของทั้งสองแบบ ไม่ใช่ให้ PHQ-A หายไปเพราะ 8Q หนักกว่า — คนละเรื่องกับสถิติ
      // โรงเรียนที่ต้องการจุดเดียวต่อรอบ
      const owner = useUserStore.getState().profile?.studentId;
      for (const step of result.steps) {
        remember({
          assessmentId: step.assessmentId,
          score: step.score,
          action: step.action as AssessAction,
          owner,
        });
      }

      // Never celebrate a session that surfaced a crisis: an emergency band, or a
      // flow that ended on the 8Q suicide-risk screen (reached only via endorsed
      // suicidal ideation or high depression).
      if (result.action === "emergency" || result.assessmentId === "8Q") return;
      earn(REWARDS.understanding, `assessment:${localDay()}`);
    },
    [earn, record, remember],
  );

  return (
    <div className="flex flex-1 flex-col justify-center py-2 ipad:mx-auto ipad:w-full ipad:max-w-xl">
      <MentalHealthAssessment onComplete={handleComplete} />
    </div>
  );
}
