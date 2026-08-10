import type { Metadata } from "next";

import { AdminAppointmentsBoard } from "@/components/admin/AdminAppointmentsBoard";

export const metadata: Metadata = { title: "จัดการนัดพูดคุย — S.Well-Being" };

export default function AdminAppointmentsPage() {
  return <AdminAppointmentsBoard />;
}
