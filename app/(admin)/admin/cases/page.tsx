import type { Metadata } from "next";

import { AdminCasesBoard } from "@/components/admin/AdminCasesBoard";

export const metadata: Metadata = { title: "จัดการเคส — S.Well-Being" };

export default function AdminCasesPage() {
  return <AdminCasesBoard />;
}
