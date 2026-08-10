import type { Metadata } from "next";

import { AdminAssessmentStats } from "@/components/admin/AdminAssessmentStats";

export const metadata: Metadata = { title: "สถิติการประเมินใจ — S.Well-Being" };

export default function AdminAssessmentsPage() {
  return <AdminAssessmentStats />;
}
