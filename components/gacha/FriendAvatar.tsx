"use client";

import { Puy } from "@/components/Puy";
import { DecoSprite } from "@/components/gacha/DecoSprite";
import { FriendSprite } from "@/components/gacha/FriendSprite";
import {
  DEFAULT_ANCHORS,
  FRIEND_ANCHORS,
  type FluffyFriend,
} from "@/data/fluffyFriends";
import { DECO_BY_ID, DECO_SLOTS } from "@/data/cozyShop";
import type { EquippedSet } from "@/lib/store/useGachaStore";

/**
 * Renders one Fluffy Friend at any size, with whatever it's wearing layered on
 * top. Everyone — the golden mascot included — is a hand-drawn animated
 * <FriendSprite> (emoji only as fallback for unknown ids).
 *
 * ของตกแต่งวางตาม "จุดยึดรายตัว" (FRIEND_ANCHORS) ไม่ใช่ตำแหน่งตายตัวชุดเดียว —
 * ค่าเดิมตั้งมาจากตัวกลม ๆ อย่างน้องหมี พอเอาไปใส่ยูนิคอร์นที่มีเขา วาฬที่เป็นภาพ
 * ด้านข้าง หรือต้นอ่อนที่หน้าอยู่บนกระถาง หมวกกับแว่นก็ไปผิดที่กันหมด
 */
export function FriendAvatar({
  friend,
  equipped,
  size = 80,
  showDeco = true,
  unowned = false,
}: {
  friend: FluffyFriend;
  equipped?: EquippedSet;
  size?: number;
  showDeco?: boolean;
  unowned?: boolean;
}) {
  // ปุยไม่ได้อยู่ในชุดสไปรต์ของกาชา (คนละกรอบ คนละไฟล์) และรู้จุดวางของตกแต่ง
  // ตัวเองอยู่แล้ว จึงส่งต่อให้มันวาดทั้งชุด
  if (friend.id === "puy") {
    return (
      <Puy
        size={size}
        motion="still"
        equipped={showDeco && !unowned ? equipped : undefined}
        className={unowned ? "opacity-40 grayscale" : undefined}
      />
    );
  }

  const anchors = friend.anchors ?? FRIEND_ANCHORS[friend.id] ?? DEFAULT_ANCHORS;

  return (
    <div
      className="relative grid place-items-center select-none"
      style={{
        width: size,
        height: size,
        filter: unowned ? "grayscale(1) opacity(0.35)" : undefined,
      }}
      aria-hidden="true"
    >
      <FriendSprite id={friend.id} size={size * 0.98} fallback={friend.emoji} />

      {showDeco &&
        !unowned &&
        DECO_SLOTS.map(({ slot }) => {
          const decoId = equipped?.[slot];
          const deco = decoId ? DECO_BY_ID[decoId] : undefined;
          if (!deco) return null;
          const a = anchors[slot];
          const px = (a.scale ?? 0.35) * size;
          return (
            <span
              key={slot}
              className="pointer-events-none absolute"
              style={{
                left: `${a.at[0]}%`,
                top: `${a.at[1]}%`,
                width: px,
                height: px,
                transform: "translate(-50%, -50%)",
              }}
            >
              <DecoSprite id={deco.id} size={px} fallback={deco.emoji} />
            </span>
          );
        })}
    </div>
  );
}
