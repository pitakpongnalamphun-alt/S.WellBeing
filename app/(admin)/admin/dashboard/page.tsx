import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/AdminOverview";

export const metadata: Metadata = { title: "ภาพรวม — S.Well-Being" };

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
