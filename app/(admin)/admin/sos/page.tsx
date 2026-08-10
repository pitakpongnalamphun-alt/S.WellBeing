import type { Metadata } from "next";

import { AdminSosBoard } from "@/components/admin/AdminSosBoard";

export const metadata: Metadata = { title: "แจ้งเหตุฉุกเฉิน SOS — S.Well-Being" };

export default function AdminSosPage() {
  return <AdminSosBoard />;
}
