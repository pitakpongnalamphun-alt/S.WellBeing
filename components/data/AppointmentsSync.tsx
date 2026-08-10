"use client";

import { useEffect } from "react";

import { useAppointmentStore } from "@/lib/store/useAppointmentStore";

/**
 * ดึงนัดพูดคุยจากเซิร์ฟเวอร์เมื่อเปิดแอป และดึงซ้ำเมื่อกลับมาที่แท็บนี้
 *
 * วางไว้ทั้งสองฝั่ง: ครูต้องเห็นคิวที่นักเรียนเพิ่งจองจากมือถือ และนักเรียนต้อง
 * เห็นว่าครูกดยืนยันหรือเลื่อนเวลาให้แล้ว — ทั้งคู่คือข้อมูลชุดเดียวกันคนละมุม
 *
 * ไม่เรนเดอร์อะไรเลย เป็นแค่ตัวเชื่อมข้อมูล (แบบเดียวกับ CasesSync / SosSync)
 */
export function AppointmentsSync() {
  const syncFromServer = useAppointmentStore((s) => s.syncFromServer);

  useEffect(() => {
    void syncFromServer();

    const onFocus = () => {
      if (document.visibilityState === "visible") void syncFromServer();
    };
    document.addEventListener("visibilitychange", onFocus);
    const t = window.setInterval(() => void syncFromServer(), 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.clearInterval(t);
    };
  }, [syncFromServer]);

  return null;
}

export default AppointmentsSync;
