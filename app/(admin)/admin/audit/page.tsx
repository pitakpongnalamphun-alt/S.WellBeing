import type { Metadata } from "next";

import { AdminAuditLog } from "@/components/admin/AdminAuditLog";

export const metadata: Metadata = { title: "บันทึกการเข้าถึงข้อมูล — S.Well-Being" };

export default function AdminAuditPage() {
  return <AdminAuditLog />;
}
