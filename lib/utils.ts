import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with later ones winning. Plain string concatenation
 * leaves both `p-4` and `p-6` on the element and lets source order decide,
 * which makes a component's own props unable to override its defaults.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
