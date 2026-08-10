"use client";

import { useCallback } from "react";

import { MentalHealthAssessment } from "@/components/MentalHealthAssessment";
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
    (result: { assessmentId: string; score: number; action: string }) => {
      // Log the anonymised result for school-wide statistics FIRST — every
      // session counts, including the crisis ones (which matter most to see).
      record({
        assessmentId: result.assessmentId,
        score: result.score,
        action: result.action as AssessAction,
      });
      // ประวัติส่วนตัว (อยู่แค่ในเครื่องนักเรียน ผูกกับ studentId ของคนที่ล็อกอิน)
      // — ไว้ดูพัฒนาการก่อน-หลังของตัวเอง
      remember({
        assessmentId: result.assessmentId,
        score: result.score,
        action: result.action as AssessAction,
        owner: useUserStore.getState().profile?.studentId,
      });

      // Never celebrate a session that surfaced a crisis: an emergency band, or a
      // flow that ended on the 8Q suicide-risk screen (reached only via endorsed
      // suicidal ideation or high depression).
      if (result.action === "emergency" || result.assessmentId === "8Q") return;
      earn(REWARDS.understanding, `assessment:${localDay()}`);
    },
    [earn, record, remember],
  );

  return (
    <div className="flex flex-1 flex-col justify-center py-2">
      <MentalHealthAssessment onComplete={handleComplete} />
    </div>
  );
}
