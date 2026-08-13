"use client";

import { useEffect, useRef } from "react";

import { useSosStore } from "@/lib/store/useSosStore";

/**
 * เสียงแจ้งเตือนเหตุ SOS ฝั่งครูและเจ้าหน้าที่
 *
 * เหตุ SOS ที่โผล่ขึ้นมาบนหน้าจอที่ไม่มีใครมอง ก็คือเหตุที่ยังไม่มีใครรู้ — แดชบอร์ด
 * ดึงข้อมูลใหม่ทุก 15 วินาทีอยู่แล้ว แต่ถ้าครูเวรกำลังทำอย่างอื่นหรือสลับแท็บไป
 * ไม่มีอะไรเรียกให้หันมามอง ตัวนี้จึงทำสองอย่าง: ส่งเสียง และเปลี่ยนชื่อแท็บ
 *
 * ⚠️ ข้อจำกัดที่แก้ไม่ได้ด้วยโค้ด (ต้องบอกให้ครูรู้ ไม่ใช่ปล่อยให้เข้าใจผิดว่าดังเสมอ)
 *   - เบราว์เซอร์ห้ามเล่นเสียงจนกว่าผู้ใช้จะคลิกอะไรสักอย่างบนหน้านั้นก่อน เปิด
 *     แดชบอร์ดค้างไว้เฉย ๆ โดยไม่แตะเลย เสียงแรกอาจไม่ดัง (คลิกครั้งเดียวก็ปลดล็อก)
 *   - ปิดแท็บหรือปิดเบราว์เซอร์แล้วไม่มีเสียง การแจ้งเตือนถึงมือถือตอนปิดแอปต้องใช้
 *     Web Push ซึ่งเป็นงานคนละก้อน
 *   - ช้าได้ถึง 15 วินาทีตามรอบการดึงข้อมูล ไม่ใช่ทันทีจริง ๆ
 */

const STORAGE_KEY = "swb.sossound";

/** เปิดเสียงไว้เป็นค่าตั้งต้น — เหตุฉุกเฉินควรดังก่อน แล้วค่อยให้คนปิดถ้าจำเป็น */
export function sosSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setSosSoundEnabled(on: boolean) {
  window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  window.dispatchEvent(new Event("swb-sossound"));
}

/**
 * เสียงสองโน้ตซ้ำสามรอบ สร้างจาก Web Audio ไม่ใช้ไฟล์เสียง — จะได้ไม่ต้องแบกไฟล์
 * เข้ามาในโปรเจกต์ และไม่มีปัญหาเรื่องโหลดไฟล์ไม่ทันตอนต้องใช้จริง
 *
 * ตั้งใจให้เป็นเสียงกระดิ่งที่ "เรียกให้หันมา" ไม่ใช่ไซเรนที่ทำให้ทั้งห้องพักครูตกใจ
 */
function playChime(ctx: AudioContext) {
  const base = ctx.currentTime + 0.02;
  for (let round = 0; round < 3; round += 1) {
    [880, 1174.7].forEach((freq, i) => {
      const at = base + round * 0.85 + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.28, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.42);
    });
  }
}

export function SosSiren() {
  const alerts = useSosStore((s) => s.alerts);

  /** id ที่เคยเห็นแล้ว — ของที่มีอยู่ตั้งแต่เปิดหน้าไม่ต้องส่งเสียง */
  const seen = useRef<Set<string> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const baseTitle = useRef<string>("");

  useEffect(() => {
    baseTitle.current = document.title;
    return () => {
      document.title = baseTitle.current;
      void ctxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const active = alerts.filter((a) => a.status === "active");

    // รอบแรกหลังโหลดหน้า: จดว่ามีอะไรอยู่แล้วบ้าง แล้วเงียบไว้ — ไม่งั้นทุกครั้งที่
    // เปิดแดชบอร์ดจะมีเสียงเตือนย้อนหลังของเหตุเก่าทั้งหมด
    if (seen.current === null) {
      seen.current = new Set(active.map((a) => a.id));
      return;
    }

    // เงื่อนไข "ใหม่" ต้องดูเวลาที่เกิดเหตุด้วย ไม่ใช่แค่ "ไม่เคยเห็น id นี้"
    //
    // ตอนเปิดหน้า สโตร์อ่านของในเครื่องมาก่อน แล้ว SosSync ค่อยดึงของจากเซิร์ฟเวอร์มาทับ
    // อีกเสี้ยววินาทีถัดมา รอบนั้นจะมีเหตุเก่าที่เครื่องนี้ไม่เคยเห็นโผล่มาเป็นกอง — ถ้านับ
    // ว่าใหม่ทั้งหมด ครูจะได้ยินเสียงเตือนย้อนหลังของเหตุเมื่อสัปดาห์ที่แล้วทุกครั้งที่เปิดหน้า
    const RECENT_MS = 3 * 60 * 1000;
    const now = Date.now();
    const unseen = active.filter((a) => !seen.current!.has(a.id));
    unseen.forEach((a) => seen.current!.add(a.id));
    const fresh = unseen.filter((a) => now - new Date(a.createdAt).getTime() < RECENT_MS);

    if (fresh.length > 0 && sosSoundEnabled()) {
      try {
        ctxRef.current ??= new AudioContext();
        const ctx = ctxRef.current;
        // เบราว์เซอร์พักบริบทเสียงไว้จนกว่าจะมีการโต้ตอบ — ปลุกก่อนแล้วค่อยเล่น
        void ctx.resume().then(() => playChime(ctx));
      } catch {
        // เล่นเสียงไม่ได้ก็ไม่เป็นไร ชื่อแท็บด้านล่างยังเตือนอยู่
      }
      navigator.vibrate?.([200, 100, 200]);
    }

    // ชื่อแท็บ — สำหรับตอนที่ครูเวรสลับไปทำอย่างอื่นแต่ยังเปิดแดชบอร์ดค้างไว้
    const waiting = active.filter((a) => !a.acknowledgedAt).length;
    document.title = waiting > 0 ? `🔴 SOS ${waiting} เหตุ — ${baseTitle.current}` : baseTitle.current;
  }, [alerts]);

  return null;
}

export default SosSiren;
