"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, RotateCcw, Sparkles } from "lucide-react";

import { FluffyBuddy, type FluffyExpression } from "@/components/FluffyBuddy";

/* ============================================================== game engine */

type Choice = {
  label: string;
  energy: number; // delta applied to the emotional battery
  outcome: string; // shown right after the choice
  next?: string; // id of the next node, or undefined → the episode ends
};
type StoryNode = { id: string; text: string; choices: Choice[] };
type Scenario = {
  id: string;
  episode: string;
  title: string;
  start: string;
  nodes: Record<string, StoryNode>;
  /** A CBT-style reframe shown on the summary — encouraging, never judgemental. */
  tip: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "ghosting-group",
    episode: "ตอนที่ 1",
    title: "งานกลุ่มที่เพื่อนหายเงียบ",
    start: "n1",
    nodes: {
      n1: {
        id: "n1",
        text: "พรุ่งนี้ต้องส่งงานกลุ่มแล้ว แต่เพื่อน 2 คนยังไม่ส่งส่วนของตัวเองมาเลย ทักไปก็ไม่ตอบ ตอนนี้ 4 ทุ่มแล้ว เอาไงดี?",
        choices: [
          { label: "ทำเองหมดเลยอดนอนเอา (ตัดปัญหา)", energy: -20, outcome: "งานเสร็จ แต่คุณเหนื่อยล้ามากและรู้สึกโกรธเพื่อนลึก ๆ" },
          { label: "ทิ้งข้อความในกลุ่มว่า จะรอถึง 5 ทุ่ม ถ้าไม่ส่งขอตัดชื่อออกนะ", energy: +10, outcome: "คุณปกป้องขอบเขตของตัวเองได้ดี แม้จะลุ้นนิด ๆ ว่าเพื่อนจะโกรธไหม" },
          { label: "แพนิค ร้องไห้ ไม่ทำแล้ว", energy: -30, outcome: "ความเครียดพุ่งปรี๊ด พรุ่งนี้ค่อยไปตายเอาดาบหน้า" },
        ],
      },
    },
    tip: "ลองแยก “สิ่งที่เราคุมได้” (ส่วนงานของเรา, การสื่อสารขอบเขต) ออกจาก “สิ่งที่เราคุมไม่ได้” (การกระทำของเพื่อน) นะ — การตั้งเส้นตายอย่างสุภาพแล้วบอกให้ชัด คือการดูแลทั้งงานและใจตัวเองไปพร้อมกัน 💚",
  },

  {
    id: "public-comment",
    episode: "ตอนที่ 2",
    title: "โดนเมนต์แรงหน้าห้อง",
    start: "n1",
    nodes: {
      n1: {
        id: "n1",
        text: "มีคนเมนต์ในกลุ่มแชทห้องว่างานที่คุณทำ “ห่วยมาก ทำใหม่ไป” ต่อหน้าเพื่อนทั้งห้อง คุณรู้สึกหน้าชาไปหมด จะทำยังไง?",
        choices: [
          { label: "เมนต์สวนกลับให้หายแค้น", energy: -15, outcome: "รู้สึกสะใจแวบนึง แต่ข้อความเริ่มบานปลายเป็นดราม่าทั้งห้อง", next: "n2" },
          { label: "ทักไปคุยส่วนตัวว่ารู้สึกไม่โอเคกับคำพูดนั้น", energy: +15, outcome: "คุณบอกความรู้สึกอย่างตรงไปตรงมา โดยไม่ทำร้ายใคร — กล้าหาญมาก" },
          { label: "เก็บไว้คนเดียว ปั้นยิ้มเหมือนไม่มีอะไร", energy: -10, outcome: "ภายนอกดูโอเค แต่ข้างในยังเจ็บและคิดวนอยู่ทั้งคืน" },
        ],
      },
      n2: {
        id: "n2",
        text: "ดราม่าเริ่มบานปลาย มีคนเลือกข้าง แชทเด้งไม่หยุด คุณเริ่มเหนื่อยแล้ว จะเอายังไงต่อ?",
        choices: [
          { label: "ทักไปขอโทษและชวนจบเรื่องดี ๆ", energy: +10, outcome: "บรรยากาศค่อย ๆ เย็นลง คุณกล้าหาญมากที่ยอมเดินเข้าหาก่อน" },
          { label: "ปิดแชท วางมือถือ หายใจก่อน", energy: +5, outcome: "คุณได้พักใจ และเลือกจะไม่เติมฟืนใส่กองไฟ — ฉลาดมาก" },
        ],
      },
    },
    tip: "คำพูดของคนอื่นสะท้อน “อารมณ์ของเขาในตอนนั้น” มากกว่าคุณค่าที่แท้จริงของเรา ลองแยก “ตัวเรา” ออกจาก “ชิ้นงาน” — งานปรับได้ ส่วนคุณค่าของคุณไม่ได้ลดลงเพราะเมนต์เดียว 🧡",
  },

  {
    id: "effort-no-reward",
    episode: "ตอนที่ 3",
    title: "ตั้งใจแล้วแต่คะแนนไม่มา",
    start: "n1",
    nodes: {
      n1: {
        id: "n1",
        text: "คุณตั้งใจอ่านหนังสือหนักมากสำหรับสอบครั้งนี้ แต่คะแนนออกมาน้อยกว่าที่หวังไว้เยอะ รู้สึกท้อสุด ๆ จะทำยังไงต่อ?",
        choices: [
          { label: "โทษตัวเองว่าโง่ ไม่เอาไหน", energy: -25, outcome: "คำที่พูดกับตัวเองแรงกว่าใคร ๆ และทำให้ยิ่งจมดิ่ง" },
          { label: "ลองดูว่าพลาดตรงไหน แล้วปรับวิธีอ่านใหม่", energy: +15, outcome: "คุณเปลี่ยนความผิดหวังให้เป็นบทเรียน — นี่แหละใจที่โตขึ้น" },
          { label: "เลิกสนใจไปเลย ยังไงก็ไม่มีทางเก่ง", energy: -20, outcome: "การยอมแพ้ช่วยให้เจ็บน้อยลงชั่วคราว แต่ก็ปิดโอกาสตัวเองไปด้วย" },
        ],
      },
    },
    tip: "ลองพูดกับตัวเองเหมือนพูดกับเพื่อนสนิทที่เพิ่งพลาดดูนะ — คุณคงไม่ด่าเขาว่าโง่ใช่ไหม? คะแนนบอกแค่ “วิธีอ่านรอบนี้” ยังไม่เวิร์ก ไม่ได้บอกว่าคุณ “ไม่เก่ง” ความผิดหวังคือข้อมูล ไม่ใช่คำตัดสิน 🌱",
  },

  {
    id: "compare-trap",
    episode: "ตอนที่ 4",
    title: "คะแนนเพื่อนขึ้นฟีด",
    start: "n1",
    nodes: {
      n1: {
        id: "n1",
        text: "เพื่อนโพสต์รูปคะแนนสอบลงสตอรี่ ได้เกือบเต็มทุกวิชา ส่วนของคุณเพิ่งได้กลับมาแบบกลาง ๆ นิ้วคุณค้างอยู่ที่หน้าจอ จะทำยังไงต่อ?",
        choices: [
          { label: "ไถดูของทุกคนในห้องให้ครบ", energy: -25, outcome: "ยิ่งไถยิ่งเจอคนที่ทำได้ดีกว่า ครึ่งชั่วโมงผ่านไปพร้อมกับความรู้สึกว่าตัวเองไม่มีค่า", next: "n2" },
          { label: "กดใจให้เพื่อน แล้ววางมือถือ", energy: +10, outcome: "ยินดีกับเพื่อนได้จริง ๆ โดยไม่ต้องเอาตัวเองไปวางเทียบ — วางมือถือแล้วใจเบาขึ้นเยอะ" },
          { label: "แคปไว้ เอาไว้เตือนตัวเองว่ายังห่างแค่ไหน", energy: -15, outcome: "ตั้งใจจะใช้เป็นแรงผลักดัน แต่สุดท้ายมันกลายเป็นไม้เรียวที่เก็บไว้ตีตัวเองทุกคืน", next: "n2" },
        ],
      },
      n2: {
        id: "n2",
        text: "คืนนั้นคุณนอนไม่หลับ ในหัวมีแต่ประโยคว่า “ทำไมเราไม่เก่งเท่าเขา” จะจัดการกับคืนนี้ยังไง?",
        choices: [
          { label: "เขียนสิ่งที่ตัวเองทำได้ดีขึ้นจากเทอมที่แล้ว 3 ข้อ", energy: +15, outcome: "พอเทียบกับ “ตัวเองเมื่อวาน” แทนที่จะเทียบกับคนอื่น คุณก็เห็นเส้นทางที่ขยับมาจริง ๆ" },
          { label: "ตั้งเป้าว่าเทอมหน้าต้องชนะเขาให้ได้", energy: -10, outcome: "มีไฟขึ้นมาแวบหนึ่ง แต่เป็นไฟที่จุดจากความกลัวแพ้ ซึ่งมักมอดเร็วและทิ้งความเหนื่อยไว้" },
          { label: "ทักไปถามเพื่อนว่าอ่านยังไง", energy: +10, outcome: "เปลี่ยนคนที่รู้สึกว่าเป็นคู่แข่ง ให้กลายเป็นคนที่เรียนรู้ด้วยกันได้ — ฉลาดมาก" },
        ],
      },
    },
    tip: "โซเชียลมีเดียให้เราเห็น “ไฮไลต์” ของคนอื่น แล้วเอาไปเทียบกับ “เบื้องหลัง” ของตัวเอง ซึ่งเป็นการเทียบที่ไม่ยุติธรรมตั้งแต่แรก ลองเปลี่ยนคู่เทียบเป็นตัวเราเมื่อเดือนที่แล้วดูนะ — นั่นคือคู่เทียบเดียวที่มีข้อมูลครบทั้งสองฝั่ง 💙",
  },

  {
    id: "put-it-off",
    episode: "ตอนที่ 5",
    title: "เดี๋ยวพรุ่งนี้ค่อยทำ",
    start: "n1",
    nodes: {
      n1: {
        id: "n1",
        text: "รายงานส่งอีก 5 วัน คุณเปิดไฟล์เปล่าค้างไว้ตั้งแต่เมื่อวาน พอจะเริ่มพิมพ์ทีไรก็รู้สึกอึดอัดจนต้องหยิบมือถือขึ้นมาแทน ตอนนี้สามทุ่มแล้ว",
        choices: [
          { label: "ปิดไฟล์ก่อน ค่อยเริ่มพรุ่งนี้ตอนสมองสดกว่า", energy: -10, outcome: "ใจโล่งขึ้นทันที… แต่พอถึงพรุ่งนี้ ความอึดอัดก้อนเดิมก็ยังรออยู่ที่เดิม แถมเวลาน้อยลงไปอีกวัน", next: "n2" },
          { label: "ตั้งเวลา 10 นาที เขียนอะไรก็ได้ที่ห่วยที่สุดก่อน", energy: +15, outcome: "พอเลิกเล็งว่าต้องดี ก็เริ่มได้จริง และมักเลยสิบนาทีไปโดยไม่รู้ตัว — สมองติดเครื่องแล้ว" },
          { label: "ด่าตัวเองว่าขี้เกียจ แล้วบังคับให้นั่งทำสามชั่วโมงรวด", energy: -20, outcome: "นั่งอยู่หน้าจอครบสามชั่วโมงจริง แต่ได้งานไม่ถึงย่อหน้า เพราะสมองใช้แรงไปกับการกลัวหมดแล้ว", next: "n2" },
        ],
      },
      n2: {
        id: "n2",
        text: "เหลืออีก 2 วัน งานยังไม่คืบ ความรู้สึกผิดเริ่มหนักจนไม่กล้าแม้แต่จะเปิดไฟล์ จะเอายังไงดี?",
        choices: [
          { label: "แบ่งงานเป็นชิ้นเล็กที่สุด แล้วทำแค่ชิ้นแรกวันนี้", energy: +15, outcome: "“หาข้อมูล 3 แหล่ง” ทำได้ใน 20 นาที และพอมีชิ้นแรกอยู่ในมือ ชิ้นต่อไปก็ไม่น่ากลัวเท่าเดิม" },
          { label: "ขอครูเลื่อนส่ง พร้อมบอกแผนว่าจะส่งเมื่อไหร่", energy: +5, outcome: "ใจเต้นแรงตอนพิมพ์ข้อความ แต่การสื่อสารล่วงหน้าดูน่าเชื่อถือกว่าการเงียบแล้วหายไปมาก" },
          { label: "ยอมแพ้ ไม่ส่งแล้ว", energy: -25, outcome: "ความอึดอัดหายไปทันทีในคืนนี้ แล้วกลับมาเป็นก้อนที่ใหญ่กว่าเดิมในวันประกาศคะแนน" },
        ],
      },
    },
    tip: "การผัดวันไม่ใช่ความขี้เกียจ แต่เป็นวิธีที่สมองใช้หนี “ความรู้สึกอึดอัด” ที่เกิดตอนเริ่มงาน — ยิ่งด่าตัวเองยิ่งอึดอัด ยิ่งอึดอัดยิ่งหนี ทางออกจึงไม่ใช่วินัยที่มากขึ้น แต่คือทำให้ก้าวแรกเล็กลงจนไม่น่ากลัว เริ่มแค่ 10 นาทีก็พอ 🌱",
  },
];

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Reads the battery as a mood, so the buddy feels what the student feels. */
function moodFor(energy: number): FluffyExpression {
  if (energy >= 70) return "happy";
  if (energy >= 45) return "content";
  if (energy >= 25) return "concerned";
  return "sad";
}

/* ================================================================= the game */

export type LifeSkillGameProps = {
  /** Fired when an episode is finished (e.g. to award coins). Gets the final battery. */
  onComplete?: (finalEnergy: number) => void;
  /**
   * Scenario to open with (index into SCENARIOS, clamped) — lets the Game Hub
   * launch a specific episode. Read once on mount; remount (key) to change it.
   */
  startEpisode?: number;
  className?: string;
};

/** Public list of playable scenarios, so the hub can map its game ids. */
export const SCENARIO_IDS: string[] = SCENARIOS.map((s) => s.id);

/** Exiting trees must be unclickable — a stale click from a view sliding out
 *  runs an outdated closure (wrong node/episode) against current state. */
const slide = {
  initial: { opacity: 0, x: 44 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -44, pointerEvents: "none" as const },
};

export function LifeSkillGame({
  onComplete,
  startEpisode = 0,
  className,
}: LifeSkillGameProps) {
  const first = Math.max(0, Math.min(SCENARIOS.length - 1, startEpisode));
  const [episode, setEpisode] = useState(first);
  const [energy, setEnergy] = useState(50);
  const [nodeId, setNodeId] = useState(SCENARIOS[first].start);
  const [picked, setPicked] = useState<Choice | null>(null); // set → showing the outcome
  const [done, setDone] = useState(false);
  const [reactKey, setReactKey] = useState(0); // bumps to bounce the buddy

  const scenario = SCENARIOS[episode];
  const node = scenario.nodes[nodeId];
  const mood = moodFor(energy);
  const hasNextEpisode = episode < SCENARIOS.length - 1;
  // Sync mirror of "a choice is locked in" — state alone can't stop a double-tap
  // that lands before React flushes (it would apply the energy delta twice).
  const pickLock = useRef(false);
  // Which episode already fired onComplete — a doubled tap on the last "ไปต่อ"
  // must not report the finish twice.
  const completedRef = useRef<number | null>(null);

  function pick(choice: Choice) {
    if (pickLock.current) return;
    pickLock.current = true;
    setEnergy((e) => clamp(e + choice.energy));
    setPicked(choice);
    setReactKey((k) => k + 1);
  }

  function proceed() {
    if (!picked) return;
    if (picked.next && scenario.nodes[picked.next]) {
      pickLock.current = false;
      setNodeId(picked.next);
      setPicked(null);
    } else {
      if (completedRef.current === episode) return;
      completedRef.current = episode;
      setDone(true);
      onComplete?.(energy);
    }
  }

  function replay() {
    pickLock.current = false;
    completedRef.current = null;
    setEnergy(50);
    setNodeId(scenario.start);
    setPicked(null);
    setDone(false);
    setReactKey((k) => k + 1);
  }

  function nextEpisode() {
    if (!hasNextEpisode) return;
    pickLock.current = false;
    const idx = episode + 1;
    setEpisode(idx);
    setEnergy(50);
    setNodeId(SCENARIOS[idx].start);
    setPicked(null);
    setDone(false);
    setReactKey((k) => k + 1);
  }

  const view = done ? `done-${episode}` : picked ? `out-${episode}-${nodeId}` : `node-${episode}-${nodeId}`;

  return (
    <div
      className={[
        "mx-auto flex w-full max-w-md flex-col gap-5 rounded-[2rem]",
        "bg-gradient-to-b from-rose-50/50 via-white to-violet-50/50 p-6",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Buddy + Emotional Battery */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative grid size-28 place-items-center">
          <div className="pointer-events-none absolute size-24 rounded-full bg-pink-200/50 blur-xl motion-safe:animate-pulse" />
          <motion.div
            key={reactKey}
            initial={{ scale: 0.85 }}
            animate={{ scale: [0.85, 1.08, 1], rotate: [0, -4, 3, 0] }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <FluffyBuddy expression={mood} size={92} />
          </motion.div>
        </div>

        <div className="w-full">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Heart className="size-3.5 fill-pink-400 text-pink-400" /> พลังใจ
            </span>
            <span className="tabular-nums">{energy}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-400"
              animate={{ width: `${energy}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
        </div>
      </div>

      {/* Card area — slides between scenario / outcome / summary */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={slide}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          {done ? (
            <Summary
              energy={energy}
              tip={scenario.tip}
              hasNext={hasNextEpisode}
              onReplay={replay}
              onNext={nextEpisode}
            />
          ) : picked ? (
            <Outcome choice={picked} onNext={proceed} />
          ) : (
            <>
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <span className="mb-2 inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-[0.7rem] font-semibold text-violet-600">
                  {scenario.episode} · {scenario.title}
                </span>
                <p className="text-[1.02rem] font-medium leading-relaxed text-slate-800">{node.text}</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {node.choices.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(c)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-[0.95rem] font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md active:translate-y-0 active:scale-[0.99]"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------- sub-views */

function Outcome({ choice, onNext }: { choice: Choice; onNext: () => void }) {
  const up = choice.energy >= 0;
  return (
    <>
      <div className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
        <span
          className={`mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
            up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
          }`}
        >
          <Heart className={`size-4 ${up ? "fill-emerald-500 text-emerald-500" : "fill-rose-400 text-rose-400"}`} />
          พลังใจ {up ? "+" : ""}
          {choice.energy}
        </span>
        <p className="text-[1.02rem] leading-relaxed text-slate-700">{choice.outcome}</p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mx-auto flex items-center gap-2 rounded-full bg-violet-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-200/70 transition hover:bg-violet-600 active:scale-95"
      >
        ต่อไป
        <ArrowRight className="size-5" />
      </button>
    </>
  );
}

function Summary({
  energy,
  tip,
  hasNext,
  onReplay,
  onNext,
}: {
  energy: number;
  tip: string;
  hasNext: boolean;
  onReplay: () => void;
  onNext: () => void;
}) {
  const s =
    energy >= 60
      ? { emoji: "🌟", head: "ดูแลใจตัวเองได้ดีมากเลย!", msg: "คุณรับมือสถานการณ์นี้โดยที่ยังรักษาพลังใจไว้ได้ เยี่ยมมากเลยนะ 💚" }
      : energy >= 35
        ? { emoji: "🌱", head: "คุณผ่านมันมาได้แล้วนะ", msg: "อาจจะไม่ง่าย แต่คุณก็ก้าวผ่านมันมาได้ ค่อย ๆ เติมพลังใจกลับมานะ" }
        : { emoji: "🫂", head: "เหนื่อยมากเลยใช่ไหม ไม่เป็นไรนะ", msg: "สถานการณ์แบบนี้หนักจริง ๆ ไม่ว่าคุณจะเลือกทางไหน มันก็โอเคที่จะรู้สึกท่วมท้น ลองมาดูอีกมุมด้วยกันนะ" };

  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b from-violet-50 to-white p-6 text-center ring-1 ring-violet-100">
      <div className="text-4xl" aria-hidden="true">
        {s.emoji}
      </div>
      <h2 className="text-xl font-bold text-slate-800">{s.head}</h2>
      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
        พลังใจสุดท้าย: {energy}%
      </span>
      <p className="text-sm leading-relaxed text-slate-600">{s.msg}</p>

      {/* CBT-style tip */}
      <div className="w-full rounded-2xl bg-emerald-50 p-4 text-left ring-1 ring-emerald-100">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <Sparkles className="size-3.5" /> ลองคิดแบบนี้ดู
        </p>
        <p className="text-[0.85rem] leading-relaxed text-emerald-800">{tip}</p>
      </div>

      <div className="flex w-full gap-2.5">
        <button
          type="button"
          onClick={onReplay}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-800 active:scale-95"
        >
          <RotateCcw className="size-4" />
          เล่นอีกครั้ง
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200/70 transition hover:bg-violet-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {hasNext ? "ตอนต่อไป" : "จบครบทุกตอนแล้ว"}
          {hasNext && <ArrowRight className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default LifeSkillGame;
