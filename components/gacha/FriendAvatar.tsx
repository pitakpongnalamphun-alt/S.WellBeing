"use client";

import { FluffyBuddy } from "@/components/FluffyBuddy";
import { FriendSprite } from "@/components/gacha/FriendSprite";
import { GOLDEN_FLUFFY, type FluffyFriend } from "@/data/fluffyFriends";
import { DECO_BY_ID } from "@/data/cozyShop";
import type { EquippedSet } from "@/lib/store/useGachaStore";

/**
 * Renders one Fluffy Friend at any size, with whatever it's wearing layered on
 * top. The golden mascot is a real <FluffyBuddy>; everyone else is a hand-drawn
 * animated <FriendSprite> (emoji only as fallback for unknown ids).
 * Decoration emojis sit in three fixed spots: hat on top, face over the eyes,
 * something held at the bottom-right.
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
  return (
    <div
      className="relative grid place-items-center select-none"
      style={{ width: size, height: size, filter: unowned ? "grayscale(1) opacity(0.35)" : undefined }}
      aria-hidden="true"
    >
      {friend.goldenFluffy ? (
        <FluffyBuddy
          expression="happy"
          size={size * 0.92}
          gradient={GOLDEN_FLUFFY.gradient}
          ink={GOLDEN_FLUFFY.ink}
          glowColor={GOLDEN_FLUFFY.glow}
        />
      ) : (
        <FriendSprite id={friend.id} size={size * 0.98} fallback={friend.emoji} />
      )}

      {showDeco && !unowned && equipped?.hat && DECO_BY_ID[equipped.hat] && (
        <span className="pointer-events-none absolute" style={{ top: "-8%", fontSize: size * 0.36, lineHeight: 1 }}>
          {DECO_BY_ID[equipped.hat].emoji}
        </span>
      )}
      {showDeco && !unowned && equipped?.face && DECO_BY_ID[equipped.face] && (
        <span
          className="pointer-events-none absolute"
          style={{ top: "34%", fontSize: size * 0.3, lineHeight: 1 }}
        >
          {DECO_BY_ID[equipped.face].emoji}
        </span>
      )}
      {showDeco && !unowned && equipped?.hold && DECO_BY_ID[equipped.hold] && (
        <span
          className="pointer-events-none absolute"
          style={{ bottom: "-4%", right: "-6%", fontSize: size * 0.32, lineHeight: 1 }}
        >
          {DECO_BY_ID[equipped.hold].emoji}
        </span>
      )}
    </div>
  );
}

export default FriendAvatar;
