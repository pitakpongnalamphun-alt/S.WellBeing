import type { Metadata } from "next";

import { LoginScreen } from "@/components/login/LoginScreen";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ — S.Well-Being",
  description: "เข้าสู่ระบบเพื่อไปต่อกับเส้นทางของคุณ",
};

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginScreen />
    </LanguageProvider>
  );
}
