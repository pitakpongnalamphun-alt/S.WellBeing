import type { Metadata } from "next";

import { StaffLoginScreen } from "@/components/auth/StaffLoginScreen";

export const metadata: Metadata = { title: "เข้าสู่ระบบเจ้าหน้าที่ — S.Well-Being" };

export default function StaffLoginPage() {
  return <StaffLoginScreen />;
}
