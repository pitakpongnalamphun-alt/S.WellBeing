"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import { FluffyBuddy } from "@/components/FluffyBuddy";
import { CLOUD_COLORS, type MoodCloud } from "@/data/cloudHugs";
import { useCloudHugsStore } from "@/lib/store/useCloudHugsStore";
import { useGachaStore } from "@/lib/store/useGachaStore";
import { localDay } from "@/lib/date";

/* ============================================================================
   Cloud Hugs — เครือข่ายส่งกอดข้ามก้อนเมฆ (anonymous peer support)

   A heavy feeling logged in the mood tracker is *released* as an anonymous cloud
   into this shared galaxy; anyone can send it a hug and earn a few Star Coins.
   Rewarding a kind act fits the app's rule — kindness/self-care are celebrated,
   distress itself is never priced.
   ========================================================================== */

const HUG_REWARD = 5;

/**
 * เมฆวางบน "ตาราง" ไม่ใช่สุ่มตำแหน่งอิสระ แล้วขยับออกจากจุดกึ่งกลางช่องเล็กน้อย
 * ตามค่าแฮชของ id เพื่อไม่ให้ดูเป็นแถวทหาร
 *
 * ของเดิมสุ่มพิกัดจาก id ตรง ๆ ซึ่งไม่มีอะไรกันเมฆทับกันเลย พอเมฆเยอะขึ้นก็มีก้อนที่
 * ถูกก้อนอื่นบังจนกดส่งกอดไม่ได้ — ตารางการันตีว่าทุกก้อนมีช่องของตัวเองที่กดโดนเสมอ
 * ส่วนความรู้สึก "ลอยอยู่ในอวกาศ" มาจากการขยับเล็กน้อยนี้ + แอนิเมชันลอยของแต่ละก้อน
 */
function seededJitter(id: string) {
  let h = 0;
  for (let k = 0; k < id.length; k += 1) h = (h * 31 + id.charCodeAt(k)) >>> 0;
  // >>> ไม่ใช่ >> : h เป็นเลข 32 บิตแบบไม่มีเครื่องหมาย ถ้าใช้ >> ค่าที่เกิน 2^31
  // จะกลายเป็นลบ แล้วระยะขยับจะเบ้ไปทางเดียวทั้งหมด
  return { x: (h % 13) - 6, y: ((h >>> 5) % 13) - 6 };
}

const floatVariants: Variants = {
  /** ก้อนที่อยู่นอกจอ — หยุดนิ่งตรงจุดตั้งต้น ไม่กิน GPU */
  rest: { x: 0, y: 0 },
  float: (i: number) => ({
    // แอมพลิจูดต้องเล็กกว่าครึ่งของช่องไฟระหว่างแถว (gap-y-10 = 40px) เผื่อสองแถว
    // ลอยเข้าหากันพร้อมกัน ไม่งั้นป้ายชื่อจะเหลื่อมกันจนบังปุ่มของอีกก้อน
    y: [0, -10, 4, 0],
    x: [0, 7, -6, 0],
    transition: { duration: 11 + (i % 5) * 1.2, repeat: Infinity, ease: "easeInOut", delay: (i % 6) * 0.5 },
  }),
};

/** A one-shot heart + star burst; keyed so each hug remounts a fresh burst. */
function ParticleBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 70 + Math.random() * 55;
        return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, emoji: i % 3 === 0 ? "⭐" : "💖", delay: Math.random() * 0.08 };
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.3, x: p.x, y: p.y }}
          transition={{ duration: 0.95, ease: "easeOut", delay: p.delay }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/** A cute pastel cloud with a little face — tinted per emotion, big sparkly eyes,
 *  rosy cheeks and a soft small smile. Replaces the plain ☁️ emoji. */
function CloudFace({ color, size = 46 }: { color: { glow: string; text: string }; size?: number }) {
  const body = color.text; // the palette's soft pastel doubles as the cloud's fill
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 100 80"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* fluffy body — overlapping blobs read as one cloud */}
      <g fill={body}>
        <ellipse cx="50" cy="54" rx="42" ry="20" />
        <circle cx="30" cy="48" r="16" />
        <circle cx="50" cy="40" r="21" />
        <circle cx="70" cy="48" r="16" />
      </g>
      {/* soft top highlight for a little roundness */}
      <ellipse cx="43" cy="35" rx="13" ry="7" fill="#ffffff" opacity="0.55" />
      {/* rosy cheeks */}
      <ellipse cx="33" cy="55" rx="6" ry="4" fill="#fb7185" opacity="0.45" />
      <ellipse cx="67" cy="55" rx="6" ry="4" fill="#fb7185" opacity="0.45" />
      {/* eyes + sparkle */}
      <g fill="#41415f">
        <ellipse cx="40" cy="48" rx="4.2" ry="5.4" />
        <ellipse cx="60" cy="48" rx="4.2" ry="5.4" />
      </g>
      <circle cx="41.7" cy="45.8" r="1.5" fill="#ffffff" />
      <circle cx="61.7" cy="45.8" r="1.5" fill="#ffffff" />
      {/* tiny soft smile */}
      <path d="M45,57 Q50,61 55,57" stroke="#41415f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * เมฆหนึ่งก้อนพร้อมแอนิเมชันลอย
 *
 * แยกออกมาเป็นคอมโพเนนต์ของตัวเองเพราะแต่ละก้อนต้องมี IntersectionObserver ของ
 * ตัวเอง: ก้อนที่เลื่อนพ้นจอจะหยุดลอย เหลือแต่ก้อนที่มองเห็นจริงที่ยังขยับ
 * ทุกก้อนมี drop-shadow กับ backdrop-blur ซึ่งกิน GPU มาก ถ้าปล่อยให้หลายร้อยก้อน
 * แอนิเมชันพร้อมกันทั้งที่เห็นแค่ 6 ก้อน มือถือจะกระตุกทันทีที่กาแล็กซีเริ่มแน่น
 */
function CloudItem({
  cloud,
  index,
  hugged,
  onOpen,
}: {
  cloud: MoodCloud;
  index: number;
  hugged: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // เริ่มที่ "เห็น" ไว้ก่อน เผื่อเบราว์เซอร์ไม่รองรับ observer — เมฆจะได้ไม่แข็งทื่อ
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // เผื่อขอบไว้หน่อย ก้อนที่กำลังจะเลื่อนเข้ามาจะได้ลอยอยู่ก่อนแล้ว ไม่ใช่กระตุกเริ่ม
      { rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const jitter = seededJitter(cloud.id);
  const color = CLOUD_COLORS[cloud.coreColor];

  return (
    <div ref={ref} style={{ transform: `translate(${jitter.x}px, ${jitter.y}px)` }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 + Math.min(index, 12) * 0.07, duration: 0.55, ease: [0.34, 1.3, 0.68, 1] }}
      >
        <motion.button
          type="button"
          onClick={onOpen}
          aria-label={`ก้อนเมฆความรู้สึก ${cloud.tertiaryEmotion}${cloud.mine ? " (ของฉัน)" : ""} ได้รับกอดแล้ว ${cloud.hugsReceived} ครั้ง`}
          className="flex flex-col items-center gap-1.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          variants={floatVariants}
          custom={index}
          animate={inView ? "float" : "rest"}
          whileHover={{ scale: 1.09 }}
          whileTap={{ scale: 0.94 }}
        >
          <span
            className="relative grid size-16 place-items-center rounded-full"
            style={{ background: `radial-gradient(circle at 50% 42%, ${color.glow}, transparent 72%)`, filter: `drop-shadow(0 0 14px ${color.glow})` }}
          >
            <CloudFace color={color} size={46} />
            {cloud.mine && <span className="absolute -left-1 -top-1 text-xs">🫧</span>}
            {hugged && <span className="absolute -right-1 -top-1 text-sm">💖</span>}
          </span>
          <span className="max-w-[7.5rem] rounded-full bg-white/10 px-2.5 py-1 text-center text-[0.68rem] font-medium backdrop-blur" style={{ color: color.text }}>
            {cloud.tertiaryEmotion}
          </span>
          <span className="text-[0.6rem] text-white/45">🫂 {cloud.hugsReceived}{cloud.mine ? " · ของฉัน" : ""}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export function CloudHugsGalaxy() {
  const [mounted, setMounted] = useState(false);
  const coins = useGachaStore((s) => s.coins);
  const earn = useGachaStore((s) => s.earn);
  const clouds = useCloudHugsStore((s) => s.clouds);
  const hug = useCloudHugsStore((s) => s.hug);
  const ensureMonth = useCloudHugsStore((s) => s.ensureMonth);

  const monthLabel = useMemo(
    () => new Date().toLocaleDateString("th-TH", { month: "long" }),
    [],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [huggedIds, setHuggedIds] = useState<Set<string>>(() => new Set());
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({ left: (i * 61) % 100, top: (i * 37) % 100, size: 1 + (i % 3), delay: (i % 5) * 0.6 })),
    [],
  );
  const selected = clouds.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    setMounted(true);
    // ขึ้นเดือนใหม่แล้วล้างท้องฟ้า — ทำหลัง mount เท่านั้น สโตร์ persist ยังไม่พร้อมก่อนหน้านี้
    ensureMonth();
    const day = localDay();
    const already = useGachaStore
      .getState()
      .claimed.filter((k) => k.startsWith("cloudhug:") && k.endsWith(`:${day}`))
      .map((k) => k.split(":")[1]);
    if (already.length) setHuggedIds(new Set(already));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!selectedId) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [selectedId]);

  function openCloud(id: string) {
    setBurst(0);
    setSelectedId(id);
  }

  function sendHug(cloud: MoodCloud) {
    if (huggedIds.has(cloud.id) || cloud.mine) return;
    hug(cloud.id);
    setHuggedIds((s) => new Set(s).add(cloud.id));
    const gained = earn(HUG_REWARD, `cloudhug:${cloud.id}:${localDay()}`);
    setBurst((b) => b + 1);
    setToast(gained ? `ส่งกอดสำเร็จ! คุณได้รับ +${HUG_REWARD} เหรียญดาว 🌟` : "ส่งกอดแล้ว ขอบคุณที่ใจดีนะ 💛");
    dialogRef.current?.focus();
  }

  const open = selectedId !== null;

  return (
    <motion.div
      className="relative flex h-[calc(100dvh-5rem)] w-full flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* entrance comet streak */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute z-10 h-0.5 w-20 rounded-full bg-gradient-to-r from-transparent to-white/80"
        style={{ top: "16%", rotate: "18deg" }}
        initial={{ x: "-25%", opacity: 0 }}
        animate={{ x: "125%", opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
      />

      <div className="flex flex-1 flex-col" inert={open ? true : undefined}>
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white motion-safe:animate-pulse"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: 0.5, animationDelay: `${s.delay}s` }}
            />
          ))}
        </div>

        <header className="relative z-20 flex items-center justify-between px-5 py-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="text-[1.05rem] font-bold text-white/95">กาแล็กซีแห่งการโอบกอด</h1>
            {/* บอกให้รู้ว่าท้องฟ้าเริ่มใหม่ทุกเดือน ไม่งั้นวันที่ 1 เมฆหายหมดจะงงว่าพัง */}
            <p className="text-[0.7rem] text-white/45">ท้องฟ้าเดือน{monthLabel} · เริ่มใหม่ทุกเดือน</p>
          </motion.div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-amber-200 ring-1 ring-white/15 backdrop-blur"
            aria-label={`เหรียญดาวของคุณ ${mounted ? coins : 0} เหรียญ`}
          >
            <span aria-hidden="true">🌟</span> <span className="tabular-nums" aria-hidden="true">{mounted ? coins : "—"}</span>
          </span>
        </header>

        {/* ท้องฟ้าเลื่อนได้ — เมฆเยอะกว่าหนึ่งหน้าจอก็ยังเข้าถึงได้ครบ ไม่ถูกตัดหาย
            ช่องกว้างขั้นต่ำ 9rem กว้างกว่าป้ายชื่อ (7.5rem) พอที่จะไม่ชนกันแม้ขยับแล้ว */}
        <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-3 pb-8">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] justify-items-center gap-x-2 gap-y-10 py-4">
            {clouds.map((cloud, i) => (
              <CloudItem
                key={cloud.id}
                cloud={cloud}
                index={i}
                hugged={huggedIds.has(cloud.id)}
                onOpen={() => openCloud(cloud.id)}
              />
            ))}
          </div>
        </div>

        <p className="relative z-20 pb-4 text-center text-[0.68rem] text-white/40">ทุกก้อนเมฆไม่ระบุตัวตน · ส่งได้แค่ความอบอุ่น 🔒</p>
      </div>

      <div className="sr-only" role="status" aria-live="polite">{toast ?? ""}</div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            className="pointer-events-none absolute inset-x-0 top-16 z-50 flex justify-center px-4"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            aria-hidden="true"
          >
            <div className="rounded-full bg-white/95 px-5 py-2.5 text-[0.85rem] font-semibold text-rose-500 shadow-lg">{toast}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="backdrop"
            className="absolute inset-0 z-40 grid place-items-center bg-slate-950/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={selected.mine ? `เมฆของคุณ ${selected.tertiaryEmotion}` : `ส่งกอดให้เพื่อนที่รู้สึก ${selected.tertiaryEmotion}`}
              tabIndex={-1}
              className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-slate-800 to-slate-900 p-6 text-center outline-none ring-1 ring-white/10"
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              {burst > 0 && <ParticleBurst key={burst} />}

              <div className="mx-auto w-fit">
                <FluffyBuddy expression={selected.mine ? "content" : "happy"} size={92} />
              </div>
              <p className="mt-2 text-[0.78rem] text-white/55">{selected.mine ? "เมฆที่เธอปล่อยไว้" : "มีเพื่อนกำลังรู้สึก"}</p>
              <p className="text-[1.15rem] font-bold" style={{ color: CLOUD_COLORS[selected.coreColor].text }}>“{selected.tertiaryEmotion}”</p>

              {selected.mine ? (
                <>
                  <p className="mt-3 text-[0.95rem] font-medium text-white/90">เมฆของเธอมีเพื่อน ๆ คอยดูแลอยู่นะ 💙</p>
                  <p className="mt-1.5 text-[0.72rem] text-white/50">🫂 มีคนส่งกอดให้แล้ว {selected.hugsReceived} ครั้ง</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-[0.95rem] font-medium text-white/90">ส่งกำลังใจให้เพื่อนคนนี้กันนะ 💖</p>
                  <p className="mt-1.5 text-[0.72rem] text-white/50">🫂 ได้รับกอดแล้ว {selected.hugsReceived} ครั้ง</p>
                </>
              )}

              <div className="mt-5">
                {selected.mine ? null : huggedIds.has(selected.id) ? (
                  <div className="rounded-2xl bg-white/10 py-3.5 text-[0.9rem] font-semibold text-pink-200 ring-1 ring-white/10">ส่งกอดแล้ว ขอบคุณที่ใจดีนะ 💛</div>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendHug(selected)}
                    className="w-full rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 py-4 text-[1rem] font-bold text-white shadow-lg shadow-pink-500/30 outline-none transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white/80 active:scale-95"
                  >
                    🫂 ส่งอ้อมกอดนิรนาม (Cloud Hug)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mt-2 w-full rounded-xl py-2 text-[0.8rem] font-medium text-white/50 outline-none transition hover:text-white/80 focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  ปิด
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CloudHugsGalaxy;
