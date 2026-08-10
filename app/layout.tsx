import type { Metadata, Viewport } from "next";
import {
  DM_Sans,
  Fraunces,
  Noto_Sans_Thai,
  Noto_Serif_Thai,
} from "next/font/google";

import "./globals.css";

/** Display face. Axes are exposed so `.font-display` can soften it in CSS. */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

/**
 * Thai counterparts. Fraunces and DM Sans carry no Thai glyphs, so without
 * these the Thai locale would silently fall back to whatever serif the OS
 * happens to ship — the one thing a bilingual product cannot leave to chance.
 */
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  display: "swap",
  variable: "--font-noto-thai",
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai"],
  display: "swap",
  variable: "--font-noto-serif-thai",
});

export const metadata: Metadata = {
  title: "S.WELL-BEING — Understand your mind",
  description:
    "Track, understand, and regulate your emotions. Log in to continue your journey.",
};

export const viewport: Viewport = {
  themeColor: "#efebe3",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={[
        fraunces.variable,
        dmSans.variable,
        notoSansThai.variable,
        notoSerifThai.variable,
      ].join(" ")}
    >
      <body>{children}</body>
    </html>
  );
}
