import type { Metadata } from "next";

import { AdminGuideBoard } from "@/components/admin/AdminGuideBoard";

export const metadata: Metadata = { title: "คู่มือการดูแล — S.Well-Being" };

export default function AdminGuidePage() {
  return <AdminGuideBoard />;
}
