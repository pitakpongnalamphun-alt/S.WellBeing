import type { Metadata } from "next";

import { AdminMoodStats } from "@/components/admin/AdminMoodStats";

export const metadata: Metadata = { title: "วิเคราะห์อารมณ์นักเรียน — S.Well-Being" };

export default function AdminMoodPage() {
  return <AdminMoodStats />;
}
