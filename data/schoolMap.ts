/**
 * Pixel positions (as % of the school-map image) for each building, so the
 * analytics page can drop incident "hotspot" markers on the real campus map.
 *
 * Keys must match the location names in `data/locations.ts` exactly. Coordinates
 * are estimated from the map artwork and are meant to be nudged by eye — tweak
 * x / y (0–100, % of the image width/height) until each marker sits on its
 * building. `no` is the number printed on the map, kept for reference.
 *
 * Drop the map artwork at the path in SCHOOL_MAP_IMAGE. The page renders it in a
 * 2000×1414 box with object-contain, so save the image at (roughly) that ratio —
 * a very different ratio letterboxes the image and the markers won't line up. If
 * your asset has another ratio, update the aspectRatio in AdminAnalyticsBoard to
 * match it, then nudge the x/y below.
 */
export const SCHOOL_MAP_IMAGE = "/assets/school-map.png";

export type MapMarker = { th: string; no: number; x: number; y: number };

export const SCHOOL_MAP_MARKERS: MapMarker[] = [
  { th: "อาคารเซนต์คาเบรียล", no: 1, x: 26, y: 58 },
  { th: "อาคารอิลเดอฟองโซ", no: 2, x: 41.5, y: 68.5 },
  { th: "อาคารยอห์นแมรี่", no: 3, x: 44.5, y: 79 },
  { th: "ACT ปังนม", no: 4, x: 49, y: 72.5 },
  { th: "อาคารเซนต์ปีเตอร์", no: 5, x: 37, y: 58.5 },
  { th: "อาคารบ้านพักภราดา", no: 6, x: 16, y: 46 },
  { th: "หอประชุมหลุยส์ มารี เดอ มงฟอร์ต", no: 7, x: 29.5, y: 42 },
  { th: "อาคารรัตนบรรณาคาร", no: 8, x: 41.5, y: 54.5 },
  { th: "อาคารเซนต์แมรี่", no: 9, x: 61.5, y: 62.5 },
  { th: "อาคารอัสสัมชัญ", no: 10, x: 55.5, y: 47.5 },
  { th: "อาคารเทิดเทพรัตน์ '36", no: 11, x: 40, y: 42 },
  { th: "อาคารอเล็กซิส มิวสิค", no: 12, x: 37.5, y: 38.5 },
  { th: "อาคารเซนต์แอนดรูว์ 1-2", no: 13, x: 43, y: 32 },
  { th: "อาคารเทโอฟาน", no: 14, x: 43, y: 29 },
  { th: "อาคารโกลเด้นจูบิลี", no: 15, x: 50, y: 33 },
  { th: "อาคารลาวสุต", no: 16, x: 49, y: 29 },
  { th: "ACT สปอร์ต อารีนา", no: 17, x: 57, y: 33 },
  { th: "สนามกีฬาองประชานุกูล", no: 18, x: 70, y: 41 },
  { th: "อาคารเซนต์โยเซฟ", no: 19, x: 73, y: 55.5 },
  { th: "อาคารราฟาแอล", no: 20, x: 63.5, y: 47 },
  { th: "อาคารมาร์ติน", no: 21, x: 75, y: 52 },
  { th: "อาคารซ่อมบำรุง", no: 22, x: 81, y: 47 },
  { th: "ศูนย์การเรียนรู้เศรษฐกิจพอเพียง", no: 23, x: 81, y: 41 },
  { th: "อุทยานกาญจนาภิเษก", no: 24, x: 72, y: 38.5 },
];

export const SCHOOL_MAP_BY_NAME: Record<string, MapMarker> = Object.fromEntries(
  SCHOOL_MAP_MARKERS.map((m) => [m.th, m]),
);

/** Locations that aren't a spot on the campus map — reported separately. */
export const OFF_MAP_LOCATIONS = new Set<string>([
  "โซเชียลมีเดีย / ออนไลน์",
  "นอกโรงเรียน",
]);
