"use client";

import type { ReactNode } from "react";

import { AppleIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

import { GoogleSignInButton } from "./GoogleSignInButton";

type ProviderButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

function ProviderButton({ icon, label, onClick }: ProviderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-center gap-3 rounded-full",
        "border border-line bg-surface py-3.5 text-[0.9rem] font-medium text-ink",
        "transition-all duration-200",
        "hover:border-ink-mute/45 hover:bg-panel/40",
        "active:translate-y-px",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

type SocialAuthButtonsProps = {
  onProvider: (provider: "google" | "apple") => void;
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
      <ProviderButton
        icon={<AppleIcon className="size-[1.25rem] text-ink" />}
        label={t.apple}
        onClick={() => onProvider("apple")}
      />
    </div>
  );
}
