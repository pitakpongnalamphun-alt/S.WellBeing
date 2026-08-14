"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Puy } from "@/components/Puy";
import { HOME_STARTERS } from "@/data/chatStarters";
import { useChatStore } from "@/lib/store/useChatStore";
import { useGachaStore } from "@/lib/store/useGachaStore";

/**
 * การ์ดชวนคุยกับน้องอุ่นบนหน้าแรก
 *
 * เดิมเป็นแถวลิงก์ธรรมดาที่ใช้ไอคอน MessageCircleHeart ของ lucide ทั้งที่ทั้งฟีเจอร์
 * คือ *ตัวละคร* ตอนนี้ใช้รูปอุ่นตัวเดียวกับในห้องแชท พร้อมของตกแต่งที่เด็กแต่งไว้เอง
 *
 * ยังเป็นพระรอง ไม่แย่งที่แจ้งเหตุ: จัดลำดับด้วยอุณหภูมิสีกับความเร่งด่วน ไม่ใช่ขนาด
 * แจ้งเหตุเป็นส้มอิฐเข้มพร้อมชิป "ด่วน" ส่วนการ์ดนี้เป็นลาเวนเดอร์อ่อนและชวนคุยเฉย ๆ
 * อุ่นจึงใหญ่ได้โดยไม่กลบพระเอก
 *
 * สองสถานะ
 *   ยังไม่เคยคุย  → ชิปเริ่มบทสนทนา กดแล้วเข้าห้องพร้อมส่งประโยคนั้นเลย
 *   เคยคุยแล้ว    → ชวนคุยต่อ พร้อมบอกว่าคุยล่าสุดเมื่อไหร่
 *
 * สิ่งที่ตั้งใจ *ไม่* แสดงคือเนื้อความที่คุยไว้ แม้จะทำได้ง่าย ๆ ก็ตาม
 * หน้าแรกคือหน้าที่เด็กเปิดตอนนั่งอยู่กับเพื่อน และแอปนี้มีปุ่ม "ออกด่วน" ทุกหน้าอยู่แล้ว
 * แปลว่าเราคิดเรื่องคนแอบมองจอมาตั้งแต่ต้น การเอาประโยคล่าสุดขึ้นหน้าแรกจะทำให้
 * เรื่องที่เด็กเล่าให้อุ่นฟังคนเดียว กลายเป็นของที่คนข้าง ๆ อ่านได้โดยที่เขาไม่ได้ตั้งใจ
 */

/** "เมื่อกี้ · วันนี้ · เมื่อวาน · N วันก่อน" — หยาบ ๆ พอ ไม่ต้องบอกเวลาเป๊ะ */
function agoLabel(iso: string): string | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 0) return null; // นาฬิกาเครื่องเพี้ยน — ไม่โชว์ดีกว่าโชว์ผิด
  if (mins < 60) return "เมื่อสักครู่";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงก่อน`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "เมื่อวาน";
  if (days < 30) return `${days} วันก่อน`;
  return null; // นานเกินกว่าจะเรียกว่า "คุยค้างไว้"
}

export function PuyInvite() {
  const messages = useChatStore((s) => s.messages);
  const outfit = useGachaStore((s) => s.equipped.puy);

  // สโตร์ทั้งสองตัว rehydrate หลัง mount — เรนเดอร์สถานะ "ยังไม่เคยคุย" ไปก่อน
  // แล้วค่อยสลับ จะทำให้ HTML จากเซิร์ฟเวอร์ไม่ตรงกับรอบแรกของไคลเอนต์
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const last = mounted ? messages[messages.length - 1] : undefined;
  const ago = last?.at ? agoLabel(last.at) : null;
  const continuing = mounted && messages.length > 0;

  return (
    <section className="rounded-[1.6rem] bg-lavender-50 p-4 ring-1 ring-lavender-200/70">
      <Link
        href="/chatbot"
        className="flex items-center gap-3.5 rounded-2xl transition active:scale-[0.99]"
      >
        <span className="grid size-[4.5rem] shrink-0 place-items-center rounded-full bg-white/70">
          <Puy expression="greet" size={62} equipped={outfit} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[1.02rem] font-bold leading-snug text-ink">
            {continuing ? "กลับมาคุยกับอุ่นต่อไหม" : "วันนี้อยากเล่าอะไรให้อุ่นฟังไหม"}
          </span>
          <span className="mt-0.5 block text-[0.78rem] leading-snug text-ink-soft">
            {continuing
              ? ago
                ? `คุยค้างไว้${ago === "เมื่อสักครู่" ? "" : "เมื่อ"}${ago} · อุ่นยังอยู่ตรงนี้`
                : "อุ่นยังจำบทสนทนาที่ค้างไว้ในเครื่องนี้ได้"
              : "ไม่ต้องเรียบเรียงก็ได้ พิมพ์มามั่ว ๆ อุ่นอ่านออก"}
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-lavender-400" aria-hidden="true" />
      </Link>

      {/* ชิปเฉพาะตอนยังไม่เคยคุย — คนที่คุยค้างไว้ไม่ควรถูกชวนให้เริ่มเรื่องใหม่
          ทับเรื่องเดิมที่ยังไม่จบ */}
      {!continuing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {HOME_STARTERS.map((s) => (
            <Link
              key={s}
              href={`/chatbot?q=${encodeURIComponent(s)}`}
              className="rounded-full border border-lavender-200 bg-white px-3.5 py-1.5 text-[0.8rem] text-ink-soft transition-colors hover:border-lavender-400 hover:text-ink"
            >
              {s}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
