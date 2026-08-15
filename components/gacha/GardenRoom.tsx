"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sprout } from "lucide-react";

import { FriendAvatar } from "@/components/gacha/FriendAvatar";
import { HomeGarden } from "@/components/gacha/HomeGarden";
import { ScreenHeader } from "@/components/student/ScreenHeader";
import { FRIEND_BY_ID } from "@/data/fluffyFriends";
import { useGachaStore } from "@/lib/store/useGachaStore";

/**
 * หน้าสวนของฉัน — เปิดเข้ามาดูได้เต็ม ๆ
 *
 * เดิมสวนเป็นการ์ดโชว์อย่างเดียวบนหน้าแรก กดไม่ได้ และ prop ที่ทำให้มีปุ่มออกไปหน้าอื่น
 * (onOpenRewards) ก็ไม่เคยถูกส่งเข้ามา สวนจึงเป็นภาพนิ่งที่ดูได้อย่างเดียวมาตลอด
 *
 * หน้านี้เพิ่มสองอย่างที่การ์ดเล็กทำไม่ได้
 *   1. เห็นเพื่อนตัวใหญ่ขึ้น และมีที่ให้เขาเดินมากขึ้น
 *   2. รู้ว่าใครอยู่ในสวนบ้าง — การ์ดเล็กแสดงแต่ตัว ไม่มีชื่อ ถ้าเพิ่งได้ตัวใหม่มา
 *      ก็ไม่รู้ว่าตัวไหนคือตัวใหม่
 *
 * จงใจไม่ให้เหรียญกับการเข้ามาดู สวนเป็นที่พักสายตา ไม่ใช่ภารกิจที่ต้องมาเช็คอิน
 */
export function GardenRoom() {
  const placed = useGachaStore((s) => s.placed);
  const equipped = useGachaStore((s) => s.equipped);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const friends = mounted
    ? placed.map((id) => FRIEND_BY_ID[id]).filter(Boolean)
    : [];

  return (
    <div className="space-y-5 pb-24">
      <ScreenHeader
        title="สวนของฉัน"
        subtitle="ที่ที่เพื่อน ๆ ที่เธอสะสมมาอยู่ด้วยกัน"
      />

      <HomeGarden variant="room" />

      <section>
        <h2 className="flex items-center gap-1.5 text-[0.95rem] font-bold text-ink">
          <Sprout className="size-4 text-mint-600" aria-hidden="true" />
          ใครอยู่ในสวนบ้าง
          {mounted ? (
            <span className="ml-1 text-[0.8rem] font-medium text-ink-mute">
              {friends.length} ตัว
            </span>
          ) : null}
        </h2>

        {mounted && friends.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-panel/50 p-4 text-[0.86rem] leading-relaxed text-ink-soft">
            สวนยังว่างอยู่ — ไปที่แก๊งเพื่อนปุย เลือกเพื่อนที่ชอบ แล้วกด
            &lsquo;วางไว้ในสวน&rsquo; เขาจะมาเดินเล่นอยู่ตรงนี้
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-2.5">
            {friends.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-200/80"
              >
                <FriendAvatar friend={f} equipped={equipped[f.id]} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86rem] font-bold text-ink">
                    {f.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.72rem] text-ink-mute">
                    {f.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/rewards"
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-mint-700 text-[0.9rem] font-semibold text-white transition-colors hover:bg-mint-600 active:translate-y-px"
      >
        จัดสวน · เพิ่มหรือเอาเพื่อนออก
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default GardenRoom;
