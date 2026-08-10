"use client";

import { useEffect } from "react";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

/** Somewhere ordinary that raises no questions if someone glances at the screen. */
const COVER_URL = "https://www.google.com/search?q=homework+help";

/**
 * Leave the app immediately and leave nothing behind on screen.
 *
 * A student may be reading this in a room where being seen using a mental
 * health app is itself the risk. Escape twice, or one tap, and the tab is on a
 * neutral page with this app's history entry replaced — pressing Back does not
 * bring it back.
 *
 * What this does NOT do is erase anything already synced, or defeat a browser
 * profile that keeps full history. It buys a few seconds against a glance over
 * the shoulder, which is what it is for. Say so honestly rather than implying
 * it is untraceable.
 */
export function QuickExitButton({ className }: { className?: string }) {
  useEffect(() => {
    let lastEscape = 0;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const now = Date.now();
      // Double-tap within 600ms, so a single Escape can still close a dialog.
      if (now - lastEscape < 600) leave();
      lastEscape = now;
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function leave() {
    // replace(), not assign(): the app must not sit one Back press away.
    window.location.replace(COVER_URL);
  }

  return (
    <button
      type="button"
      onClick={leave}
      title="Esc Esc"
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5",
        "bg-white/85 text-[0.8rem] font-medium text-ink-soft ring-1 ring-neutral-300",
        "backdrop-blur-sm transition-colors hover:bg-white hover:text-ink",
        className,
      )}
    >
      <LogOut className="size-4" aria-hidden="true" />
      ออกด่วน
    </button>
  );
}
