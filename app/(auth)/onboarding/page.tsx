import type { Metadata } from "next";
import { Suspense } from "react";

import { OnboardingRoute } from "@/components/auth/OnboardingRoute";

export const metadata: Metadata = {
  title: "ยืนยันข้อมูล — S.Well-Being",
  description: "กรอกข้อมูลเพิ่มเติมเพื่อเข้าสู่พื้นที่ปลอดภัย",
};

export default function OnboardingPage() {
  // useSearchParams (inside OnboardingRoute) must sit under a Suspense
  // boundary in the App Router.
  return (
    <Suspense>
      <OnboardingRoute />
    </Suspense>
  );
}
