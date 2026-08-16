import type { ReactNode } from "react";

import { AppointmentsSync } from "@/components/data/AppointmentsSync";
import { CasesSync } from "@/components/data/CasesSync";
import { SosSync } from "@/components/data/SosSync";
import { StatsPush } from "@/components/data/StatsPush";
import { QuickExitButton } from "@/components/shared/QuickExitButton";
import { BackHomeButton } from "@/components/student/BackHomeButton";
import { MobileNav } from "@/components/student/MobileNav";
import { ConsentGuard } from "@/components/consent/ConsentGuard";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

/**
 * The student shell: a phone-width column, centred on larger screens rather
 * than stretched. Every screen in here is designed for one thumb.
 *
 * ยกเว้นแท็บเล็ต (`ipad:` — จอกว้างที่ใช้นิ้ว ดูนิยามใน globals.css) ที่กว้างขึ้น
 * เป็น 896px เพราะ iPad แนวนอนสูงแค่ 820px หน้าที่ยาว 1300px จึงต้องเลื่อนเกือบสองจอ
 * ความกว้างที่เพิ่มมาใช้ลดความสูง ไม่ใช่ใช้ยืดข้อความ — หน้าที่เป็นงานเดียวจดจ่อ
 * (แจ้งเหตุ SOS แชท หายใจ) คุมคอลัมน์ตัวเองให้แคบเท่าเดิม
 *
 * Everything below the guard handles personal data, so consent is checked once
 * at the shell rather than per page — one place to get right, and no route can
 * be added later that quietly skips it.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ConsentGuard role="student">
        <CasesSync />
        <SosSync />
        <AppointmentsSync />
        <StatsPush />
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white shadow-[0_0_60px_-30px_rgba(15,32,25,0.25)] ipad:max-w-4xl">
          <div className="pointer-events-none sticky top-0 z-30 flex items-center justify-between p-3">
            <div className="pointer-events-auto">
              <BackHomeButton />
            </div>
            <div className="pointer-events-auto">
              <QuickExitButton />
            </div>
          </div>

          {/* -mt pulls content up under the floating exit button without
              letting it overlap the first heading. `flex flex-col` lets a page
              opt into filling the height (the chat does) — pages with plain
              content still stack from the top. */}
          <main className="-mt-2 flex flex-1 flex-col px-4 pb-6 ipad:px-6">
            {children}
          </main>

          <MobileNav />
        </div>
      </ConsentGuard>
    </LanguageProvider>
  );
}
