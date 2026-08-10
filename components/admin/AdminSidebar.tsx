"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarHeart,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  ScrollText,
  Siren,
  Smile,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { BrandMark } from "@/components/icons";
import { STAFF_ROLE_META } from "@/data/staff";
import {
  useStaffSession,
  useStaffSessionStore,
} from "@/lib/store/useStaffSessionStore";
import { canAccess } from "@/lib/adminAccess";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; Icon: LucideIcon };
type NavSection = { title: string; items: NavItem[] };

/**
 * Grouped, always-labelled navigation. The admin side is a desk tool, so every
 * link shows its Thai label at all times — an icon-only rail forced staff to
 * guess. Sections keep the eight destinations scannable: what you do for a
 * student, what you read as statistics, and the system log.
 *
 * Staff routes carry an /admin prefix. Route groups don't create URL segments,
 * so `(student)/dashboard` and `(admin)/dashboard` would both resolve to
 * `/dashboard` and collide — the prefix is what keeps them apart.
 */
const SECTIONS: NavSection[] = [
  {
    title: "ภาพรวม",
    items: [{ href: "/admin/dashboard", label: "ภาพรวม", Icon: LayoutDashboard }],
  },
  {
    title: "ดูแลนักเรียน",
    items: [
      { href: "/admin/cases", label: "จัดการเคส", Icon: FolderKanban },
      { href: "/admin/sos", label: "SOS ฉุกเฉิน", Icon: Siren },
      { href: "/admin/appointments", label: "นัดพูดคุย", Icon: CalendarHeart },
      { href: "/admin/guide", label: "คู่มือการดูแล", Icon: BookOpen },
    ],
  },
  {
    title: "สถิติ & วิเคราะห์",
    items: [
      { href: "/admin/insights", label: "AI วิเคราะห์แนวโน้ม", Icon: Sparkles },
      { href: "/admin/analytics", label: "วิเคราะห์จุดเกิดเหตุ", Icon: MapIcon },
      { href: "/admin/mood", label: "วิเคราะห์อารมณ์", Icon: Smile },
      { href: "/admin/assessments", label: "สถิติประเมินใจ", Icon: ClipboardList },
    ],
  },
  {
    title: "ระบบ",
    items: [
      { href: "/admin/staff", label: "บัญชีเจ้าหน้าที่", Icon: Users },
      { href: "/admin/audit", label: "บันทึกการเข้าถึง", Icon: ScrollText },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const staff = useStaffSession();
  const signOut = useStaffSessionStore((s) => s.signOut);

  function logout() {
    signOut();
    router.replace("/staff-login");
  }

  // Fail closed: hide links the role can't use, and drop a whole section when
  // nothing in it remains (e.g. the tech admin has no "ดูแลนักเรียน" group).
  const sections = SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter(({ href }) => !!staff && canAccess(href, staff.role)),
  })).filter((s) => s.items.length > 0);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white lg:w-64">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <BrandMark className="size-7 shrink-0 text-mint-700" />
        <span className="text-[0.86rem] font-semibold tracking-tight text-ink">
          S.Well-Being
        </span>
      </div>

      <nav
        aria-label="เมนูผู้ดูแลระบบ"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        {sections.map((section) => (
          <div key={section.title} className="mb-5 last:mb-0">
            <p className="px-3 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-mute">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[0.88rem] transition-colors",
                        active
                          ? "bg-mint-100 font-medium text-mint-700"
                          : "text-ink-soft hover:bg-neutral-100 hover:text-ink",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[1.15rem] shrink-0",
                          active ? "text-mint-700" : "text-ink-mute",
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate th:leading-snug">
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Signed-in staff + sign out */}
      {staff && (
        <div className="border-t border-neutral-200 p-3">
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint-50 text-base">
              {staff.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.82rem] font-medium text-ink">
                {staff.name}
              </span>
              <span className="block truncate text-[0.7rem] text-ink-mute">
                {STAFF_ROLE_META[staff.role].label}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
              className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-mute transition hover:bg-risk-high-bg hover:text-risk-high"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
