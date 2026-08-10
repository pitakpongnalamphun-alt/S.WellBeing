import type { Metadata } from "next";

import { AdminInsightsBoard } from "@/components/admin/AdminInsightsBoard";

export const metadata: Metadata = { title: "AI วิเคราะห์แนวโน้ม — S.Well-Being" };

export default function AdminInsightsPage() {
  return <AdminInsightsBoard />;
}
