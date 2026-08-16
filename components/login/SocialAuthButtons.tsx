"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

import { GoogleSignInButton } from "./GoogleSignInButton";

/**
 * ปุ่มเข้าสู่ระบบด้วยผู้ให้บริการภายนอก
 *
 * ตอนนี้เหลือ Google อย่างเดียว — ปุ่ม Apple ถูกถอดออกเพราะยังกดแล้วไม่ได้ยืนยัน
 * ตัวตนจริง (เดิมเรียก signIn("apple") เปล่า ๆ) การมีปุ่มที่ดูใช้ได้แต่ไม่ได้ยืนยัน
 * ใคร แปลว่าใครก็สร้าง session ได้โดยไม่ผ่านการตรวจสอบ
 *
 * จะกลับมาได้เมื่อมี Apple Developer Program + Services ID + โดเมนที่ยืนยันแล้ว
 * (ดูโครงเดียวกับ GoogleSignInButton ที่ใช้ signInWithIdToken)
 */

type SocialAuthButtonsProps = {
  /** ทางเดโม เมื่อยังไม่ได้ตั้งค่า Google Client ID */
  onProvider: (provider: "google") => void;
  /** Google ยืนยันตัวตนจริงสำเร็จ (ตรวจ token ฝั่งเซิร์ฟเวอร์แล้ว) */
  onGoogleVerified: (profile: { email: string; name: string | null }) => void;
};

export function SocialAuthButtons({ onProvider, onGoogleVerified }: SocialAuthButtonsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <GoogleSignInButton
        onVerified={onGoogleVerified}
        onDemo={() => onProvider("google")}
        demoLabel={t.google}
      />
    </div>
  );
}
