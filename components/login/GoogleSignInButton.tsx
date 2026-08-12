"use client";

import { useEffect, useRef, useState } from "react";

import { GoogleIcon } from "@/components/icons";
import { getClient } from "@/lib/supabase/client";

/**
 * ปุ่ม "เข้าสู่ระบบด้วย Google" ของจริง — Google Identity Services (GIS)
 *
 * มี Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID) → เรนเดอร์ปุ่มทางการของ Google,
 * ผู้ใช้ล็อกอิน → GIS คืน ID token → ส่งไปตรวจลายเซ็นที่ /api/auth/google →
 * ผ่านแล้วจึงเรียก onVerified(email) ให้แอปสร้าง session ต่อ
 *
 * ไม่มี Client ID (เช่น เครื่อง dev ที่ยังไม่ตั้งค่า) → ปุ่มเดิมแบบเดโมยังใช้ได้
 * ผ่าน onDemo เพื่อไม่ให้ผู้ทดลองใช้เจอทางตัน
 */

const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GsiButtonConfig = {
  theme?: string;
  size?: string;
  shape?: string;
  text?: string;
  locale?: string;
  width?: number;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, config: GsiButtonConfig) => void;
        };
      };
    };
  }
}

/** โหลดสคริปต์ GIS ครั้งเดียวทั้งแอป */
let gisLoader: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  gisLoader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisLoader = null;
      reject(new Error("gis_load_failed"));
    };
    document.head.appendChild(s);
  });
  return gisLoader;
}

export function GoogleSignInButton({
  onVerified,
  onDemo,
  demoLabel = "เข้าสู่ระบบด้วย Google",
}: {
  /** Google ยืนยันอีเมลจริงแล้ว (ผ่านการตรวจ token ฝั่งเซิร์ฟเวอร์) */
  onVerified: (profile: { email: string; name: string | null }) => void;
  /** ทางเดโมเดิม เมื่อยังไม่ได้ตั้งค่า Client ID */
  onDemo: () => void;
  /** ข้อความบนปุ่มสำรอง — ผู้เรียกส่งมาเพราะหน้านี้ใช้ได้ทั้งในและนอกระบบแปลภาษา */
  demoLabel?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    let ro: ResizeObserver | undefined;
    let lastWidth = 0;

    /**
     * วาดปุ่มตามความกว้าง "จริง" ของกล่องที่มันอยู่
     *
     * GIS รับ width เป็นพิกเซลเท่านั้น (ใส่ % ไม่ได้) ของเดิมฮาร์ดโค้ด 368px ไว้ ซึ่ง
     * กว้างกว่าพื้นที่บนมือถือ (จอ 390px เหลือให้เนื้อหาราว 310px) ปุ่มจึงดันคอลัมน์
     * ทั้งคอลัมน์ให้กว้างเกินการ์ด แล้วโดน overflow-hidden ของการ์ดตัดทิ้ง — ทุกอย่าง
     * ในฟอร์มเลยขาดหายไปทางขวาและเลื่อนตามแนวนอนไม่ได้ (แนวนอนไม่เป็นเพราะจอกว้างพอ)
     *
     * 400 คือเพดานที่ GIS รองรับ ส่วน 200 คือพื้นล่างกันปุ่มแคบจนอ่านไม่ออก
     */
    const renderGoogleButton = () => {
      const host = hostRef.current;
      if (!host || !window.google) return;
      const available = host.parentElement?.clientWidth ?? host.clientWidth;
      const width = Math.max(200, Math.min(400, Math.floor(available)));
      if (width === lastWidth) return;
      lastWidth = width;
      host.replaceChildren(); // วาดซ้ำต้องล้างปุ่มเดิมก่อน ไม่งั้นซ้อนกันสองปุ่ม
      window.google.accounts.id.renderButton(host, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        locale: "th",
        width,
      });
    };

    loadGis()
      .then(() => {
        if (cancelled || !hostRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            setStatus("verifying");
            try {
              // ทางหลัก: แลก ID token ของ Google เป็น session ของ Supabase
              // เพื่อให้ฐานข้อมูลรู้ว่า "ใครกำลังอ่าน/เขียน" — RLS ทั้งหมดยืนอยู่บนตรงนี้
              const supabase = getClient();
              if (supabase) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: credential,
                });
                if (error) throw error;
                const u = data.user;
                if (!u?.email) throw new Error("no_email");
                onVerified({
                  email: u.email,
                  name: (u.user_metadata?.full_name as string | undefined) ?? null,
                });
                return;
              }

              // ทางสำรอง (ยังไม่ตั้งค่าฐานข้อมูล): ตรวจลายเซ็น token เองฝั่งเซิร์ฟเวอร์
              // ได้ตัวตนที่เชื่อถือได้เหมือนกัน แต่ยังไม่มี session สำหรับ RLS
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ credential }),
              });
              if (!res.ok) throw new Error("verify_failed");
              const profile = (await res.json()) as {
                email: string;
                name: string | null;
              };
              onVerified(profile);
            } catch {
              setStatus("error");
            }
          },
        });
        renderGoogleButton();
        setStatus("ready");
        // หมุนจอ / เปลี่ยนขนาดหน้าต่าง แล้ววาดปุ่มใหม่ให้พอดีกล่องเสมอ
        const parent = hostRef.current.parentElement;
        if (parent && typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(() => renderGoogleButton());
          ro.observe(parent);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      ro?.disconnect();
    };
    // onVerified เปลี่ยนอ้างอิงได้ทุก render — ยึดตัวล่าสุดผ่าน closure ตอน callback ยิงจริงพอ
    // (initialize ครั้งเดียวพอ ไม่ต้อง re-init)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ไม่ได้ตั้งค่า Client ID → ปุ่มเดโมเดิม
  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={onDemo}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-surface py-3.5 text-[0.9rem] font-medium text-ink transition-all duration-200 hover:border-ink-mute/45 hover:bg-panel/40 active:translate-y-px"
      >
        <GoogleIcon className="size-[1.15rem]" />
        <span>
          {demoLabel} <span className="text-ink-mute">(เดโม)</span>
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {/* ปุ่มทางการของ Google เรนเดอร์ลงตรงนี้ */}
      <div ref={hostRef} className="flex min-h-[44px] justify-center" />
      {status === "loading" && (
        <p className="text-center text-[0.78rem] text-ink-mute">กำลังเตรียมปุ่ม Google…</p>
      )}
      {status === "verifying" && (
        <p className="text-center text-[0.78rem] text-ink-mute">กำลังยืนยันตัวตนกับ Google…</p>
      )}
      {status === "error" && (
        <p className="text-center text-[0.78rem] text-rose-500">
          เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง หรือใช้อีเมลด้านบนแทนได้
        </p>
      )}
    </div>
  );
}

export default GoogleSignInButton;
