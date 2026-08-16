"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/**
 * A small, always-visible SOS on the home screen — tucked above the tab bar on
 * the right, clear of the centred แจ้งเหตุ button.
 *
 * It links to /sos rather than firing an alert: a one-tap emergency send gets
 * pressed by accident, and a student whose first experience of the button is a
 * false alarm won't touch it again — which is exactly when it matters. The zone
 * picker and "who gets told" copy live on /sos.
 *
 * ทำไมตอนพักถึงเป็นเส้นขอบ ไม่ใช่แดงทึบ
 *
 * เดิมเป็นเม็ดยาแดงทึบที่กะพริบตลอดเวลาบนหน้าแรก ซึ่งอ่านออกมาว่า "ที่นี่มีเรื่องน่ากลัว
 * รออยู่" ทั้งที่คนส่วนใหญ่ที่เปิดแอปในวันธรรมดาไม่ได้อยู่ในภาวะฉุกเฉิน สีแดงที่ดังตลอด
 * เวลาไม่ได้ทำให้ปุ่มถูกกดตอนจำเป็นมากขึ้น แต่ทำให้ทั้งแอปดูเป็นเรื่องหนักตั้งแต่หน้าแรก
 *
 * สิ่งที่ *ไม่* ลดลงเลย เพราะเป็นเรื่องความปลอดภัย
 *   - ตำแหน่งและขนาดเท่าเดิมเป๊ะ ความจำของนิ้วต้องใช้ได้เหมือนเดิม
 *   - ตัวอักษรยังเป็นสีแดงเข้มบนพื้นขาวทึบ (ไม่ใช่โปร่งใส) และยังหนาเหมือนเดิม
 *   - คำว่า SOS ยังอยู่ ไม่เปลี่ยนเป็นไอคอนเปล่า
 *   - เข้าไปในหน้า /sos แล้วทุกอย่างกลับมาเป็นแดงเต็มตามเดิม
 *
 * ที่เอาออกคือการกะพริบ (animate-pulse) — ของที่ขยับตลอดเวลาดึงสายตาไปตลอดเวลา
 * และเป็นตัวที่ทำให้รู้สึกว่ามีอะไรผิดปกติมากที่สุด
 */
export function SosLauncher() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 px-4">
      {/* ต้องกว้างเท่าเปลือกของหน้า ไม่งั้นบนแท็บเล็ตปุ่มจะไปลอยอยู่กลางจอ
          แทนที่จะเกาะขอบขวาของแผ่นเนื้อหา */}
      <div className="mx-auto flex max-w-md justify-end ipad:max-w-4xl ipad:px-2">
        <Link
          href="/sos"
          aria-label="ขอความช่วยเหลือด่วน SOS"
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[0.82rem] font-bold text-risk-high shadow-[0_6px_16px_-8px_rgba(15,32,25,0.4)] ring-2 ring-risk-high/55 transition-all duration-200 hover:bg-risk-high hover:text-white hover:ring-risk-high active:scale-95"
        >
          <ShieldAlert className="size-4" aria-hidden="true" />
          SOS
        </Link>
      </div>
    </div>
  );
}
