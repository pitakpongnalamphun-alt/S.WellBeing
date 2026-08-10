"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { CATEGORY_META, THEMES, WISDOMS } from "@/data/wisdom";
import { PsychAvatar } from "@/components/wisdom/PsychAvatar";
import { localDay } from "@/lib/date";

/**
 * A quiet home-screen preview of the wisdom deck: 4 cards that rotate to a new
 * daily window (cycling through the full set over time) and drift on their own
 * in a seamless loop. The loop renders two identical copies and, once the scroll
 * passes the first set, jumps back by exactly one set — invisibly, since the
 * card there is the same — so it circles forever instead of rewinding.
 * "ดูทั้งหมด" or a tap opens the full deck on /wisdom.
 */
const SHOWN = 4;
const GAP = 10; // matches gap-2.5

export function WisdomStrip() {
  // Deterministic first render (SSR + first client paint) so there's no
  // hydration mismatch; the daily window + loop are applied client-side.
  const [items, setItems] = useState(() => WISDOMS.slice(0, SHOWN));
  const [loop, setLoop] = useState(false);
  const [ready, setReady] = useState(false); // fade the daily window in — no content flash
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setReady(true);
    const len = WISDOMS.length;
    if (len === 0) return;
    const count = Math.min(SHOWN, len); // never wrap the modulo into duplicates
    const s = localDay();
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const offset = h % len;
    setItems(Array.from({ length: count }, (_, i) => WISDOMS[(offset + i) % len]));
    setLoop(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!loop) return;
    const el = scrollerRef.current;
    if (!el) return;

    const first = el.firstElementChild as HTMLElement | null;
    const step = (first ? first.getBoundingClientRect().width : 200) + GAP;
    const oneSet = step * items.length; // width of one full copy

    let pos = el.scrollLeft;
    let paused = false;
    let raf = 0;
    const SPEED = 0.5; // px per frame — a gentle, continuous drift (~30px/s)

    const tick = () => {
      if (!paused) {
        pos += SPEED;
        if (pos >= oneSet) pos -= oneSet; // passed the first copy → snap back one identical set (invisible)
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => { paused = true; };
    const resume = () => { pos = el.scrollLeft; paused = false; }; // pick up wherever the user left it
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
    };
  }, [loop, items]);

  // Two copies feed the seamless loop; a reduced-motion user just gets the one.
  const rendered = loop ? [...items, ...items] : items;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[0.9rem] font-bold text-ink">
          <Quote className="size-4 text-lavender-500" aria-hidden="true" />
          แง่คิดเติมใจ
        </h2>
        <Link
          href="/wisdom"
          className="flex items-center gap-0.5 text-[0.74rem] font-medium text-ink-mute transition hover:text-lavender-500"
        >
          ดูทั้งหมด
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <ul
        ref={scrollerRef}
        className={`flex gap-2.5 overflow-x-auto pb-1.5 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{ scrollbarWidth: "none" }}
      >
        {rendered.map((w, i) => {
          const theme = THEMES[w.category];
          const cat = CATEGORY_META[w.category];
          const isClone = loop && i >= items.length; // the second copy is decorative
          return (
            <li key={`${w.id}-${i}`} className="shrink-0" aria-hidden={isClone || undefined}>
              <Link
                href={`/wisdom?id=${w.id}`}
                tabIndex={isClone ? -1 : undefined}
                className="block h-full w-[12.5rem] rounded-[1.05rem] p-[1.5px] transition hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: `linear-gradient(140deg, ${theme.ink}66, ${theme.ink}12)`, boxShadow: `0 9px 22px -12px ${theme.ink}80` }}
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-[0.95rem] bg-white p-3.5">
                  <Quote className="pointer-events-none absolute -right-1 -top-1 size-10 -scale-x-100" style={{ color: theme.ink, opacity: 0.09 }} aria-hidden="true" />
                  <span
                    className="relative self-start rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold"
                    style={{ backgroundColor: theme.chip, color: theme.chipInk }}
                  >
                    {cat.label}
                  </span>
                  <p className="relative mt-2 line-clamp-2 font-display text-[0.9rem] font-semibold leading-relaxed text-slate-700">
                    “{w.quote}”
                  </p>
                  <div className="relative mt-auto flex items-center gap-1.5 pt-3">
                    <PsychAvatar spec={w.avatar} size={28} />
                    <span className="min-w-0 truncate text-[0.7rem] font-semibold" style={{ color: theme.ink }}>{w.name}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default WisdomStrip;
