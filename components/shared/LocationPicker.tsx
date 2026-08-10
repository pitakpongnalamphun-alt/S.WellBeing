"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";

import { LOCATION_GROUPS, type Place } from "@/data/locations";
import { cn } from "@/lib/utils";

/**
 * A searchable location combobox, shared by แจ้งเหตุ and SOS. Compact by design:
 * one field that opens a grouped, filterable list rather than a wall of buttons.
 */
export function LocationPicker({
  value,
  onChange,
  placeholder = "ค้นหาหรือเลือกสถานที่",
}: {
  value: Place | null;
  onChange: (place: Place) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LOCATION_GROUPS;
    return LOCATION_GROUPS.map((g) => ({
      ...g,
      places: g.places.filter(
        (p) =>
          p.th.toLowerCase().includes(q) || p.en.toLowerCase().includes(q),
      ),
    })).filter((g) => g.places.length > 0);
  }, [query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-2xl border bg-white px-3.5 py-3 text-left transition-colors",
          value ? "border-mint-400" : "border-neutral-300",
          "focus:outline-none focus:ring-4 focus:ring-mint-100",
        )}
      >
        <MapPin className="size-[1.1rem] shrink-0 text-mint-600" aria-hidden="true" />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[0.9rem]",
            value ? "text-ink" : "text-ink-mute",
          )}
        >
          {value ? value.th : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-mute transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_40px_-20px_rgba(23,36,30,0.35)]">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-3">
            <Search className="size-4 shrink-0 text-ink-mute" aria-hidden="true" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์ชื่ออาคาร…"
              aria-label="ค้นหาสถานที่"
              className="w-full py-3 text-[0.88rem] text-ink placeholder:text-ink-mute focus:outline-none"
            />
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto p-1.5">
            {groups.length === 0 ? (
              <li className="px-3 py-6 text-center text-[0.84rem] text-ink-mute">
                ไม่พบสถานที่ที่ค้นหา
              </li>
            ) : (
              groups.map((group) => (
                <li key={group.label}>
                  <p className="px-2.5 pb-1 pt-2 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-ink-mute">
                    {group.label}
                  </p>
                  {group.places.map((place) => {
                    const selected = value?.th === place.th;
                    return (
                      <button
                        key={place.th}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          onChange(place);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                          selected
                            ? "bg-mint-50 text-mint-700"
                            : "text-ink-soft hover:bg-neutral-50 hover:text-ink",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.86rem] font-medium">
                            {place.th}
                          </span>
                          <span className="block truncate text-[0.72rem] text-ink-mute">
                            {place.en}
                          </span>
                        </span>
                        {selected ? (
                          <Check className="size-4 shrink-0 text-mint-600" aria-hidden="true" />
                        ) : null}
                      </button>
                    );
                  })}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default LocationPicker;
