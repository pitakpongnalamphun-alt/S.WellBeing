"use client";

/**
 * หน้าตรวจงานชั่วคราว — ส่องเพื่อนปุยทุกตัวขนาดใหญ่เทียบกันในหน้าเดียว
 * ไม่ได้ลิงก์จากที่ไหนในแอป ใช้สำหรับรีวิวงานวาดเท่านั้น ลบทิ้งได้เสมอ
 */
import { FLUFFY_FRIENDS } from "@/data/fluffyFriends";
import { FriendSprite, SPRITE_IDS } from "@/components/gacha/FriendSprite";

const SIZE = 190;

export default function DevSpritesPage() {
  return (
    <main style={{ background: "#f4f1ea", minHeight: "100vh", padding: 28 }}>
      <h1 style={{ font: "700 20px/1.3 system-ui", color: "#3f3a34", margin: "0 0 4px" }}>
        เพื่อนปุย — หน้าตรวจงาน
      </h1>
      <p style={{ font: "13px/1.5 system-ui", color: "#7a736a", margin: "0 0 22px" }}>
        {SPRITE_IDS.length} ตัวที่วาดเป็น SVG · เรียงตามลำดับในไฟล์ข้อมูล
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(5, ${SIZE + 24}px)`,
          gap: 18,
        }}
      >
        {FLUFFY_FRIENDS.filter((f) => SPRITE_IDS.includes(f.id)).map((f) => (
          <figure
            key={f.id}
            style={{
              margin: 0,
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e4ded4",
              padding: 12,
              textAlign: "center",
            }}
          >
            <FriendSprite id={f.id} size={SIZE} fallback={f.emoji} />
            <figcaption style={{ font: "600 12px/1.4 system-ui", color: "#3f3a34", marginTop: 6 }}>
              {f.name}
              <span style={{ display: "block", font: "11px/1.4 ui-monospace, monospace", color: "#9a9186" }}>
                {f.id}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
