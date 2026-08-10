"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  ImagePlus,
  Loader2,
  Lock,
  Phone,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

import { FluffyMascot } from "@/components/FluffyMascot";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { type Place } from "@/data/locations";
import { useCasesStore, type CaseExpectation } from "@/lib/store/useCasesStore";
import { cn } from "@/lib/utils";

/* ============================================================================
   S.Well-Being — Safe-Ticket
   A four-step, chat-like report fronted by น้องปุย. The student first names
   what's wrong, then chooses how much help they want — and it's that second
   choice, not a buried toggle, that decides whether the ticket is identified or
   anonymous. Steps 3–4 (the story and where it happened) are unchanged.

   Single-file on purpose (easy to lift and test). It reads the app's mint /
   lavender design tokens from globals.css, so it stays in step with the rest of
   the product rather than hard-coding its own palette.

   On "anonymous but honest": the 🔒 option collects no identity and opens no
   case — the school sees it only as an aggregate data point. So the success
   screen for that path never shows a tracking code or a "teacher is coming"
   timeline it can't honour; it thanks the student and keeps the 1323 hotline in
   reach.
   ========================================================================== */

/* -- Step 1 · Categories ---------------------------------------------------
   Big, full-width cards with a soft emoji badge — the point is to lower the
   pressure of reaching out, not raise it. Five choices, each its own hue so
   they read as distinct doors. */
type Category = {
  id: "bully" | "academic" | "family" | "unsafe" | "harassment" | "other";
  emoji: string;
  label: string;
  hint: string;
  tint: string;
  ring: string;
};

const CATEGORIES: Category[] = [
  {
    id: "bully",
    emoji: "💬",
    label: "โดนกลั่นแกล้ง / ไซเบอร์บูลลี่",
    hint: "โดนล้อ ด่า หรือประจาน ทั้งต่อหน้าและออนไลน์",
    tint: "bg-lavender-100",
    ring: "ring-lavender-400",
  },
  {
    id: "academic",
    emoji: "📚",
    label: "เครียดเรื่องเรียน / สอบ",
    hint: "กดดัน เรียนไม่ทัน หรือกลัวสอบ",
    tint: "bg-mint-100",
    ring: "ring-mint-400",
  },
  {
    id: "family",
    emoji: "🏠",
    label: "ปัญหาที่บ้าน / ครอบครัว",
    hint: "เรื่องในบ้านที่ทำให้ไม่สบายใจ",
    tint: "bg-amber-100",
    ring: "ring-amber-400",
  },
  {
    id: "unsafe",
    emoji: "⚠️",
    label: "รู้สึกไม่ปลอดภัย",
    hint: "ถูกข่มขู่ ทำร้าย หรือกลัวว่าจะเกิดอันตราย",
    tint: "bg-rose-100",
    ring: "ring-rose-400",
  },
  {
    id: "harassment",
    emoji: "✋",
    label: "คุกคามทางเพศ",
    hint: "โดนแตะเนื้อต้องตัว หรือคำพูดที่ทำให้อึดอัด",
    tint: "bg-fuchsia-100",
    ring: "ring-fuchsia-400",
  },
  {
    id: "other",
    emoji: "☁️",
    label: "เรื่องอื่น ๆ ที่อึดอัดใจ",
    hint: "อะไรก็ได้ที่อยากเล่าให้ฟัง",
    tint: "bg-sky-100",
    ring: "ring-sky-400",
  },
];

/* -- Step 2 · Expectation --------------------------------------------------
   The student sets the pace. This choice decides identity + urgency, so the
   whole rest of the flow (and the success screen) follows from it. */
type Expectation = "urgent" | "prepare" | "anonymous";
type ExpectationOption = {
  id: Expectation;
  emoji: string;
  label: string;
  desc: string;
  tint: string;
  ring: string;
};

const EXPECTATIONS: ExpectationOption[] = [
  {
    id: "urgent",
    emoji: "🆘",
    label: "อยากให้ครูติดต่อกลับด่วน",
    desc: "ครูแนะแนวจะรีบติดต่อกลับหาคุณโดยเร็วที่สุด",
    tint: "bg-rose-100",
    ring: "ring-rose-400",
  },
  {
    id: "prepare",
    emoji: "⏳",
    label: "อยากให้ครูรับรู้ แต่ขอเวลาเตรียมใจก่อน",
    desc: "ครูจะรับรู้เรื่องไว้ และรอให้คุณพร้อมก่อนค่อยทักไปคุย",
    tint: "bg-lavender-100",
    ring: "ring-lavender-400",
  },
  {
    id: "anonymous",
    emoji: "🔒",
    label: "แค่อยากระบาย ขอส่งแบบไม่ระบุตัวตน",
    desc: "ส่งแบบไม่บอกว่าเป็นใคร โรงเรียนจะเห็นเป็นข้อมูลภาพรวมเพื่อดูแลส่วนกลาง แต่จะไม่มีการติดตามเป็นรายบุคคล",
    tint: "bg-mint-100",
    ring: "ring-mint-400",
  },
];

const STEPS = [
  { n: 1, label: "เรื่อง" },
  { n: 2, label: "ช่วยเหลือ" },
  { n: 3, label: "รายละเอียด" },
  { n: 4, label: "สถานที่" },
] as const;

/* -- Form state ------------------------------------------------------------ */
type FormState = {
  category: Category["id"] | null;
  expectation: Expectation | null;
  name: string;
  room: string;
  phone: string;
  incident: string;
  victim: string;
  perpetrator: string;
  location: Place | null;
};

const EMPTY: FormState = {
  category: null,
  expectation: null,
  name: "",
  room: "",
  phone: "",
  incident: "",
  victim: "",
  perpetrator: "",
  location: null,
};

/** Anonymity is derived from the Step-2 choice, never stored separately. */
const isAnonymous = (form: FormState) => form.expectation === "anonymous";

/* ============================================================================
   Reusable field chrome
   ========================================================================== */

function FieldLabel({
  children,
  optional,
  required,
}: {
  children: React.ReactNode;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-2 text-[0.85rem] font-medium text-ink">
      {children}
      {optional ? (
        <span className="text-[0.72rem] font-normal text-ink-mute">
          (ไม่บังคับ)
        </span>
      ) : null}
      {required ? (
        <span className="text-[0.72rem] font-normal text-rose-500">
          (จำเป็น)
        </span>
      ) : null}
    </span>
  );
}

/**
 * เบอร์ที่ติดต่อกลับได้จริง — ตัดอักขระที่ไม่ใช่ตัวเลขออกแล้วต้องเหลืออย่างน้อย 9 หลัก
 * (เบอร์บ้าน 9 หลัก มือถือ 10 หลัก) กันกรอกขีดหรือเว้นวรรคผ่านไปเฉย ๆ
 */
const hasUsablePhone = (phone: string) => phone.replace(/\D/g, "").length >= 9;

/**
 * เส้นทางที่ระบุตัวตน (ด่วน / ขอเวลาเตรียมใจ) ต้องมีข้อมูลติดต่อครบ
 * เพราะครูต้องติดต่อกลับได้จริง — เรื่องที่ไม่มีใครตามตัวได้คือเรื่องที่ช่วยไม่ได้
 * ส่วนเส้นทางไม่ระบุตัวตนไม่ต้องกรอกอะไรเลยตามเจตนาของมัน
 */
const contactComplete = (form: FormState) =>
  isAnonymous(form) ||
  (form.name.trim().length > 0 &&
    form.room.trim().length > 0 &&
    hasUsablePhone(form.phone));

const inputClass =
  "w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-3 text-[0.9rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100";

/* ============================================================================
   Step 1 — category (fronted by น้องปุย)
   ========================================================================== */

function StepCategory({
  form,
  set,
}: {
  form: FormState;
  set: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center">
        <FluffyMascot size={112} />
        <p className="mt-3 text-[1.05rem] font-bold leading-snug text-ink">
          วันนี้มีเรื่องอะไรให้เราช่วยดูแลไหม?
        </p>
        <p className="mt-1 text-[0.8rem] text-ink-soft">
          เลือกเรื่องที่ใกล้เคียงที่สุด แค่เรื่องเดียวก็พอ
        </p>
      </div>

      {/* Urgent lane — the old SOS folded in. A student in immediate danger
          shouldn't have to pick a category and fill a form first; this jumps
          straight to the duty-teacher alert. */}
      <Link
        href="/sos"
        className="flex items-center gap-3 rounded-2xl bg-risk-high-bg p-3.5 ring-1 ring-risk-high/30 transition active:scale-[0.99]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-risk-high text-white">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.88rem] font-bold text-risk-high">
            🆘 ต้องการความช่วยเหลือด่วนตอนนี้
          </span>
          <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-soft">
            กดบอกครูเวรให้รีบไปหา ไม่ต้องกรอกอะไรมาก
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-risk-high" aria-hidden="true" />
      </Link>

      <div className="space-y-2.5">
        {CATEGORIES.map(({ id, emoji, label, hint, tint, ring }) => {
          const selected = form.category === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => set({ category: id })}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-2xl border-2 bg-white p-4 text-left transition-all duration-200 active:scale-[0.99]",
                selected
                  ? cn("ring-2 ring-offset-1", ring, "border-transparent")
                  : "border-neutral-200 hover:border-neutral-300",
              )}
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl text-[1.5rem]",
                  tint,
                )}
                aria-hidden="true"
              >
                {emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-bold leading-snug text-ink">
                  {label}
                </span>
                <span className="mt-0.5 block text-[0.76rem] leading-snug text-ink-mute">
                  {hint}
                </span>
              </span>
              {selected ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-mint-600">
                  <Check className="size-3.5 text-white" aria-hidden="true" />
                </span>
              ) : (
                <ChevronRight className="size-4 shrink-0 text-ink-mute" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   Step 2 — how much help (sets identity + urgency)
   ========================================================================== */

function StepExpectation({
  form,
  set,
}: {
  form: FormState;
  set: (patch: Partial<FormState>) => void;
}) {
  const anonymous = isAnonymous(form);
  const showContact = form.expectation !== null && !anonymous;

  return (
    <div className="space-y-4">
      <p className="text-[0.85rem] leading-relaxed text-ink-soft">
        คุณอยากให้เราช่วยแบบไหน? เลือกได้ตามที่สบายใจ — คุณเป็นคนกำหนดจังหวะเอง
        ไม่ต้องกลัวว่าแจ้งแล้วครูจะบุกมาหาทันที
      </p>

      <div className="space-y-2.5">
        {EXPECTATIONS.map(({ id, emoji, label, desc, tint, ring }) => {
          const selected = form.expectation === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() =>
                // Choosing anonymous must leave no identity behind, even in
                // client state — clear any contact typed under another option.
                set(
                  id === "anonymous"
                    ? { expectation: id, name: "", room: "", phone: "" }
                    : { expectation: id },
                )
              }
              aria-pressed={selected}
              className={cn(
                "flex w-full items-start gap-3.5 rounded-2xl border-2 bg-white p-4 text-left transition-all duration-200 active:scale-[0.99]",
                selected
                  ? cn("ring-2 ring-offset-1", ring, "border-transparent")
                  : "border-neutral-200 hover:border-neutral-300",
              )}
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl text-[1.3rem]",
                  tint,
                )}
                aria-hidden="true"
              >
                {emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9rem] font-bold leading-snug text-ink">
                  {label}
                </span>
                <span className="mt-1 block text-[0.76rem] leading-relaxed text-ink-mute">
                  {desc}
                </span>
              </span>
              {selected ? (
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint-600">
                  <Check className="size-3.5 text-white" aria-hidden="true" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Contact fields — only for a student who wants to be reached. */}
      {showContact ? (
        <div className="space-y-3.5 rounded-2xl bg-lavender-50 p-4 ring-1 ring-lavender-200/70">
          <div>
            <p className="flex items-center gap-1.5 text-[0.88rem] font-semibold text-lavender-700">
              <Phone className="size-4" aria-hidden="true" />
              ช่องทางให้ครูติดต่อกลับ
            </p>
            <p className="mt-1 text-[0.76rem] leading-relaxed text-ink-soft">
              กรอกให้ครบทุกช่อง เพื่อให้ครูติดต่อกลับหาคุณได้จริง —
              ข้อมูลนี้เห็นเฉพาะครูแนะแนวเท่านั้น และทุกครั้งที่ครูเปิดดูจะถูกบันทึกไว้ตรวจสอบได้
              ถ้ายังไม่พร้อมบอกว่าเป็นใคร เลือก &ldquo;ไม่ระบุตัวตน&rdquo; ด้านบนได้เสมอ
            </p>
          </div>

          <label className="block">
            <FieldLabel required>ชื่อ-นามสกุล</FieldLabel>
            <input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="ชื่อจริงและนามสกุล"
              autoComplete="name"
              className={inputClass}
            />
          </label>

          <label className="block">
            <FieldLabel required>ห้องเรียน</FieldLabel>
            <input
              value={form.room}
              onChange={(e) => set({ room: e.target.value })}
              placeholder="เช่น ม.4/2"
              className={inputClass}
            />
          </label>

          <label className="block">
            <FieldLabel required>เบอร์โทรศัพท์</FieldLabel>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-3.5 top-1/2 size-[1.05rem] -translate-y-1/2 text-ink-mute"
                aria-hidden="true"
              />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="080-000-0000"
                className={cn(inputClass, "pl-10")}
              />
            </div>
            {form.phone.trim().length > 0 && !hasUsablePhone(form.phone) && (
              <span className="mt-1.5 block text-[0.74rem] text-rose-500">
                เบอร์ยังไม่ครบ ตรวจอีกครั้งนะ (อย่างน้อย 9 หลัก)
              </span>
            )}
          </label>

          {/* บอกให้ชัดว่ายังขาดอะไร ดีกว่าปล่อยให้ปุ่มถัดไปเป็นสีเทาเฉย ๆ โดยไม่บอกเหตุผล */}
          {!contactComplete(form) && (
            <p className="text-[0.76rem] leading-relaxed text-ink-mute">
              กรอกครบทั้ง 3 ช่องแล้วจึงจะไปขั้นถัดไปได้
            </p>
          )}
        </div>
      ) : null}

      {/* Anonymous — say plainly what it does and does not do. */}
      {anonymous ? (
        <div className="rounded-2xl bg-mint-50 p-4 ring-1 ring-mint-200/70">
          <p className="flex items-center gap-1.5 text-[0.88rem] font-semibold text-mint-700">
            <Lock className="size-4" aria-hidden="true" />
            ส่งแบบไม่ระบุตัวตน
          </p>
          <p className="mt-1 text-[0.78rem] leading-relaxed text-ink-soft">
            เราจะไม่เก็บชื่อหรือเบอร์ของคุณเลย เรื่องนี้จะถูกนับรวมเป็นข้อมูลภาพรวม
            เพื่อให้โรงเรียนดูแลได้ดีขึ้น แต่จะไม่มีครูติดตามเป็นรายบุคคล
            ถ้าอยากให้มีคนติดต่อกลับ เลือกตัวเลือกด้านบนได้เสมอนะ
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================================
   Step 3 — the story
   ========================================================================== */

function StepStory({
  form,
  set,
  image,
  onPickImage,
  onClearImage,
}: {
  form: FormState;
  set: (patch: Partial<FormState>) => void;
  image: { url: string; name: string } | null;
  onPickImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}) {
  return (
    <div className="space-y-4">
      <label className="block">
        <FieldLabel>เล่าเหตุการณ์สั้น ๆ</FieldLabel>
        <textarea
          value={form.incident}
          onChange={(e) => set({ incident: e.target.value })}
          rows={4}
          maxLength={1000}
          placeholder="เกิดอะไรขึ้น เมื่อไหร่ อย่างไร…"
          className={cn(inputClass, "resize-none")}
        />
      </label>

      <label className="block">
        <FieldLabel optional>ใครถูกกระทำ</FieldLabel>
        <textarea
          value={form.victim}
          onChange={(e) => set({ victim: e.target.value })}
          rows={2}
          maxLength={300}
          placeholder="ตัวเรา หรือเพื่อน (บอกเท่าที่สบายใจ)"
          className={cn(inputClass, "resize-none")}
        />
      </label>

      <label className="block">
        <FieldLabel optional>ใครเป็นผู้กระทำ</FieldLabel>
        <textarea
          value={form.perpetrator}
          onChange={(e) => set({ perpetrator: e.target.value })}
          rows={2}
          maxLength={300}
          placeholder="ถ้าไม่รู้หรือไม่อยากบอก ข้ามได้"
          className={cn(inputClass, "resize-none")}
        />
      </label>

      <div>
        <FieldLabel optional>แนบรูปภาพ</FieldLabel>
        <p className="mb-2 text-[0.75rem] leading-relaxed text-ink-mute">
          เช่น ภาพแคปหน้าจอแชท หรือภาพบาดแผล
        </p>

        {image ? (
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt="ตัวอย่างรูปที่แนบ"
              className="size-14 shrink-0 rounded-xl object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-[0.82rem] text-ink-soft">
              {image.name}
            </span>
            <button
              type="button"
              onClick={onClearImage}
              aria-label="ลบรูปภาพ"
              className="rounded-xl p-2 text-ink-mute transition-colors hover:bg-neutral-100 hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-[0.85rem] font-medium text-ink-soft transition-colors hover:border-mint-400 hover:text-mint-700">
            <ImagePlus className="size-5" aria-hidden="true" />
            เลือกรูปภาพ
            <input
              type="file"
              accept="image/*"
              onChange={onPickImage}
              className="sr-only"
            />
          </label>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   Step 4 — location
   ========================================================================== */

function StepLocation({
  form,
  set,
}: {
  form: FormState;
  set: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[0.85rem] leading-relaxed text-ink-soft">
        เรื่องนี้เกิดที่ไหน เลือกโซนแทนการแชร์ตำแหน่ง GPS
      </p>
      <FieldLabel optional>สถานที่เกิดเหตุ</FieldLabel>
      <LocationPicker
        value={form.location}
        onChange={(place) => set({ location: place })}
      />
    </div>
  );
}

/* ============================================================================
   Urgent-help line — an in-app ticket is never an emergency channel. Louder
   when the student flagged that they feel unsafe.
   ========================================================================== */

function HotlineCard({ sensitive }: { sensitive: boolean }) {
  return (
    <a
      href="tel:1323"
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1",
        sensitive ? "ring-rose-200" : "ring-neutral-200",
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-rose-50">
        <Phone className="size-4 text-rose-600" aria-hidden="true" />
      </span>
      <span className="text-[0.8rem] leading-snug text-ink-soft">
        {sensitive
          ? "ถ้าตอนนี้รู้สึกไม่ปลอดภัย โทร "
          : "ถ้าตอนนี้ไม่ปลอดภัยหรืออยากคุยด่วน โทร "}
        <span className="font-semibold text-ink">1323</span> ได้เลย ฟรี 24 ชม.
      </span>
    </a>
  );
}

/* ============================================================================
   Reassurance hero — the calming centre of every confirmation screen.

   Soft coral → lavender wash, distraction-free. น้องปุย sits full-body in
   the middle and breathes on a slow ~6s cycle (Framer Motion) so a shaken
   student's own breath tends to settle to match it; the two soft "arms" spread
   a little on each inhale, waiting for a hug.
   ========================================================================== */

function ReassuranceHero() {
  return (
    <div
      className="rounded-[2rem] px-6 py-8 text-center ring-1 ring-white/60"
      style={{
        background: "linear-gradient(to bottom, #ffe9e1, #fce9f0 48%, #efe8fb)",
      }}
    >
      {/* Full-body น้องปุย (real artwork): arms up for a hug, breathing + squishy. */}
      <div className="mx-auto flex justify-center pb-2 pt-1">
        <FluffyMascot size={184} />
      </div>

      <h1 className="font-display th:leading-snug mt-6 text-[1.55rem] font-bold text-ink">
        เก่งมากเลยที่กล้าบอกเรา ☁️
      </h1>
      <p className="mx-auto mt-3 max-w-[21rem] text-[0.95rem] leading-relaxed text-ink-soft">
        ไม่ต้องกลัวนะ การขอความช่วยเหลือคือความกล้าหาญ
        วิธีนี้เป็นวิธีที่ดีที่สุดและปลอดภัยที่สุดแล้ว เราจะอยู่ตรงนี้เป็นเพื่อนเธอเอง
      </p>
    </div>
  );
}

/* ============================================================================
   Success — anonymous thank-you (no case opened, nothing to track)
   ========================================================================== */

function AnonymousThanks({
  sensitive,
  onReset,
}: {
  sensitive: boolean;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6 pb-4">
      <ReassuranceHero />

      <div className="rounded-2xl bg-mint-50 p-4 ring-1 ring-mint-200/70">
        <p className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-mint-700">
          <Lock className="size-4" aria-hidden="true" />
          เรื่องนี้เป็นข้อมูลภาพรวม
        </p>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
          เพราะส่งแบบไม่ระบุตัวตน จะไม่มีครูติดตามเป็นรายบุคคล
          แต่สิ่งที่คุณเล่าจะช่วยให้โรงเรียนเห็นภาพและดูแลนักเรียนได้ดีขึ้น
          ถ้าวันไหนอยากให้มีคนคุยด้วยจริง ๆ กลับมาส่งใหม่แบบเลือกให้ครูติดต่อได้เสมอนะ
        </p>
      </div>

      <HotlineCard sensitive={sensitive} />

      <div className="flex flex-col gap-2.5">
        <Link
          href="/dashboard"
          className="rounded-2xl bg-mint-700 py-3.5 text-center text-[0.9rem] font-medium text-white transition-colors hover:bg-mint-600"
        >
          กลับหน้าหลัก
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-neutral-300 py-3.5 text-[0.9rem] font-medium text-ink-soft transition-colors hover:border-neutral-400 hover:text-ink"
        >
          ส่งเรื่องใหม่
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Success — identified ticket tracker
   ========================================================================== */

const TRACK_STATUSES = [
  { label: "รอรับเรื่อง", en: "Pending" },
  { label: "กำลังดูแล", en: "In Progress" },
  { label: "คลี่คลายแล้ว", en: "Resolved" },
  { label: "ติดตามผลระยะยาว", en: "Long-term Follow-up" },
];

function TicketTracker({
  ticket,
  expectation,
  sensitive,
  onReset,
}: {
  ticket: string;
  expectation: Exclude<Expectation, "anonymous">;
  sensitive: boolean;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(ticket).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  // The current stage right after submitting is the first one.
  const currentIndex = 0;

  const intro =
    expectation === "urgent"
      ? "ครูแนะแนวได้รับเรื่องแล้ว และจะรีบติดต่อกลับโดยเร็วที่สุด"
      : "ครูแนะแนวได้รับเรื่องแล้ว และจะรอให้คุณพร้อมก่อนค่อยทักไปคุย";

  const activeHint =
    expectation === "urgent"
      ? "เรื่องด่วน — ครูกำลังจะรับเรื่องเร็ว ๆ นี้"
      : "อยู่ในคิว ครูจะติดต่อเมื่อคุณพร้อม";

  return (
    <div className="space-y-6 pb-4">
      <ReassuranceHero />

      <p className="text-center text-[0.88rem] leading-relaxed text-ink-soft">
        {intro}
      </p>

      {/* Ticket code — how tracking works. */}
      <div className="rounded-2xl bg-lavender-50 p-4 ring-1 ring-lavender-200/70">
        <p className="text-[0.75rem] text-ink-mute">รหัสรับเรื่อง</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="font-display text-[1.35rem] font-bold tracking-wider text-lavender-700">
            {ticket}
          </span>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[0.78rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition-colors hover:text-ink"
          >
            {copied ? (
              <Check className="size-3.5 text-mint-600" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-soft">
          เก็บรหัสนี้ไว้เพื่อติดตามสถานะ
        </p>
      </div>

      {/* Parcel-style tracker. */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-[0.9rem] font-bold text-ink">
          ติดตามสถานะ
          <span className="flex items-center gap-1 text-[0.7rem] font-normal text-mint-600">
            <span className="size-1.5 animate-pulse rounded-full bg-mint-500" />
            เรียลไทม์
          </span>
        </h2>

        <ol className="relative">
          {TRACK_STATUSES.map((status, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const last = i === TRACK_STATUSES.length - 1;
            return (
              <li key={status.en} className="flex gap-3.5">
                {/* Rail + node */}
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full ring-4 transition-colors",
                      active && "bg-mint-600 ring-mint-100",
                      done && "bg-mint-600 ring-white",
                      !active && !done && "bg-neutral-200 ring-white",
                    )}
                  >
                    {done ? (
                      <Check className="size-4 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          active ? "bg-white" : "bg-neutral-400",
                        )}
                      />
                    )}
                  </span>
                  {!last ? (
                    <span
                      className={cn(
                        "my-1 w-0.5 flex-1",
                        done ? "bg-mint-400" : "bg-neutral-200",
                      )}
                    />
                  ) : null}
                </div>

                {/* Label */}
                <div className={cn("pb-6", last && "pb-0")}>
                  <p
                    className={cn(
                      "text-[0.92rem] font-semibold",
                      active ? "text-ink" : "text-ink-mute",
                    )}
                  >
                    {status.label}
                  </p>
                  <p className="text-[0.72rem] text-ink-mute">{status.en}</p>
                  {active ? (
                    <p className="mt-1 text-[0.78rem] leading-relaxed text-mint-700">
                      {activeHint}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <HotlineCard sensitive={sensitive} />

      <div className="flex flex-col gap-2.5">
        <Link
          href="/dashboard"
          className="rounded-2xl bg-mint-700 py-3.5 text-center text-[0.9rem] font-medium text-white transition-colors hover:bg-mint-600"
        >
          กลับหน้าหลัก
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-neutral-300 py-3.5 text-[0.9rem] font-medium text-ink-soft transition-colors hover:border-neutral-400 hover:text-ink"
        >
          แจ้งเรื่องใหม่
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Wizard
   ========================================================================== */

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [image, setImage] = useState<{ url: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  // The shared case store is the seam to the admin side: an identified report
  // opens a trackable case; an anonymous one leaves only an aggregate signal.
  const openCase = useCasesStore((s) => s.openCase);
  const addAnonymous = useCasesStore((s) => s.addAnonymous);

  const regionRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  // Move focus to the step region on change, so keyboard and screen-reader
  // users land on the new content rather than staying on the pressed button.
  useEffect(() => {
    if (!submitted) regionRef.current?.focus();
  }, [step, submitted]);

  // Object URLs must be released or they leak for the life of the document.
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
  }, [image]);

  function pickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (image) URL.revokeObjectURL(image.url);
    setImage({ url: URL.createObjectURL(file), name: file.name });
  }

  function clearImage() {
    if (image) URL.revokeObjectURL(image.url);
    setImage(null);
  }

  // Only what's needed to move forward is required; a distressed student is
  // never blocked by an optional field. ข้อยกเว้นเดียวคือข้อมูลติดต่อของเส้นทาง
  // ที่ระบุตัวตน — ถ้าครูติดต่อกลับไม่ได้ การแจ้งก็ไม่นำไปสู่การช่วยเหลือจริง
  // (เส้นทางไม่ระบุตัวตนยังผ่านได้ทันทีเหมือนเดิม จึงไม่มีใครถูกกั้น)
  const canAdvance =
    step === 1
      ? form.category !== null
      : step === 2
        ? form.expectation !== null && contactComplete(form)
        : step === 3
          ? form.incident.trim().length > 0
          : true;

  const anonymous = isAnonymous(form);

  async function submit() {
    setSubmitting(true);
    // A real build would POST to /api/report (server-side, RLS) and attach the
    // image via storage. Here we write to the shared case store instead so the
    // admin Cases board sees it. Anonymous keeps no identity and opens no case.
    await new Promise((r) => setTimeout(r, 900));
    const cat = CATEGORIES.find((c) => c.id === form.category);
    const categoryLabel = cat?.label ?? "อื่น ๆ";
    const sensitive = form.category === "unsafe" || form.category === "harassment";

    if (anonymous) {
      addAnonymous(form.category ?? "other", categoryLabel, sensitive);
      setTicket(null);
    } else {
      const code = openCase({
        categoryId: form.category ?? "other",
        categoryLabel,
        expectation: form.expectation as CaseExpectation, // never "anonymous" here
        sensitive,
        contact: { name: form.name, room: form.room, phone: form.phone },
        incident: form.incident,
        victim: form.victim,
        perpetrator: form.perpetrator,
        location: form.location,
      });
      setTicket(code);
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  function reset() {
    clearImage();
    setForm(EMPTY);
    setStep(1);
    setSubmitted(false);
    setTicket(null);
  }

  if (submitted) {
    // Sexual harassment and feeling unsafe both put the 1323 line front-and-centre.
    const sensitive =
      form.category === "unsafe" || form.category === "harassment";
    return (
      <div className="pt-2">
        {anonymous || !ticket ? (
          <AnonymousThanks sensitive={sensitive} onReset={reset} />
        ) : (
          <TicketTracker
            ticket={ticket}
            expectation={form.expectation as Exclude<Expectation, "anonymous">}
            sensitive={sensitive}
            onReset={reset}
          />
        )}
      </div>
    );
  }

  const isLast = step === 4;

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col pb-4 pt-1">
      {/* Header */}
      <header className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="size-5 text-mint-600" aria-hidden="true" />
          <h1 className="font-display th:leading-snug text-[1.3rem] font-bold text-ink">
            แจ้งเหตุ · Safe-Ticket
          </h1>
        </div>

        {/* Stepper */}
        <ol className="flex items-center">
          {STEPS.map((s, i) => {
            const done = s.n < step;
            const active = s.n === step;
            return (
              <li
                key={s.n}
                className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}
              >
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-[0.72rem] font-bold transition-colors",
                      active && "bg-mint-600 text-white",
                      done && "bg-mint-100 text-mint-700",
                      !active && !done && "bg-neutral-100 text-ink-mute",
                    )}
                  >
                    {done ? <Check className="size-3.5" aria-hidden="true" /> : s.n}
                  </span>
                  <span
                    className={cn(
                      "text-[0.66rem] font-medium",
                      active ? "text-ink" : "text-ink-mute",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 ? (
                  <span
                    className={cn(
                      "mx-1 -mt-4 h-0.5 flex-1 rounded-full",
                      done ? "bg-mint-400" : "bg-neutral-200",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </header>

      {/* Step body — keyed so it re-animates on each change. */}
      <div
        key={step}
        ref={regionRef}
        tabIndex={-1}
        aria-label={`ขั้นที่ ${step} จาก 4 — ${STEPS[step - 1].label}`}
        className="animate-rise flex-1 focus:outline-none"
      >
        {step === 1 ? <StepCategory form={form} set={set} /> : null}
        {step === 2 ? <StepExpectation form={form} set={set} /> : null}
        {step === 3 ? (
          <StepStory
            form={form}
            set={set}
            image={image}
            onPickImage={pickImage}
            onClearImage={clearImage}
          />
        ) : null}
        {step === 4 ? <StepLocation form={form} set={set} /> : null}
      </div>

      {/* Footer nav — inline so it never collides with the tab bar. */}
      <div className="mt-6 flex items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={submitting}
            className="flex min-h-12 items-center gap-1.5 rounded-2xl border border-neutral-300 px-4 text-[0.88rem] font-medium text-ink-soft transition-colors hover:border-neutral-400 hover:text-ink disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            ย้อนกลับ
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="flex min-h-12 items-center rounded-2xl border border-neutral-300 px-4 text-[0.88rem] font-medium text-ink-soft transition-colors hover:border-neutral-400 hover:text-ink"
          >
            ยกเลิก
          </Link>
        )}

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            aria-busy={submitting || undefined}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-mint-700 px-4 text-[0.9rem] font-medium text-white shadow-[0_10px_24px_-14px_rgba(12,92,63,0.9)] transition-colors hover:bg-mint-600 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                กำลังส่ง
              </>
            ) : (
              <>
                ส่งเรื่อง
                <ShieldCheck className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => canAdvance && setStep((s) => s + 1)}
            aria-disabled={!canAdvance}
            className={cn(
              "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-[0.9rem] font-medium text-white transition-all",
              canAdvance
                ? "bg-mint-700 shadow-[0_10px_24px_-14px_rgba(12,92,63,0.9)] hover:bg-mint-600"
                : "cursor-not-allowed bg-neutral-300",
            )}
          >
            ถัดไป
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
