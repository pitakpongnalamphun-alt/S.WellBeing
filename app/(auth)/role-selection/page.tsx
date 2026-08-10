import type { Metadata } from "next";

import { RoleSelectionScreen } from "@/components/roles/RoleSelectionScreen";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "เลือกบทบาท — S.Well-Being",
  description: "เลือกบทบาทของคุณเพื่อเข้าใช้งานระบบดูแลสุขภาพจิตนักเรียน",
};

export default function SelectRolePage() {
  return (
    <LanguageProvider>
      {/* The rest of the product sits on warm canvas; this screen is white per
          spec. Painting <body> too keeps overscroll from flashing the canvas. */}
      <style>{`body { background-color: var(--color-role-page); }`}</style>
      <RoleSelectionScreen />
    </LanguageProvider>
  );
}
