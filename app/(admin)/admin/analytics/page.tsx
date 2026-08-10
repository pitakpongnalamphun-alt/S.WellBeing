import type { Metadata } from "next";

import { AdminAnalyticsBoard } from "@/components/admin/AdminAnalyticsBoard";

export const metadata: Metadata = { title: "วิเคราะห์จุดเกิดเหตุ — S.Well-Being" };

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsBoard />;
}
