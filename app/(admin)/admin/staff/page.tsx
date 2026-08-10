import type { Metadata } from "next";

import { AdminStaffBoard } from "@/components/admin/AdminStaffBoard";

export const metadata: Metadata = { title: "บัญชีเจ้าหน้าที่ — S.Well-Being" };

export default function AdminStaffPage() {
  return <AdminStaffBoard />;
}
