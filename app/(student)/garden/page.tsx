import type { Metadata } from "next";

import { GardenRoom } from "@/components/gacha/GardenRoom";

export const metadata: Metadata = { title: "สวนของฉัน — S.Well-Being" };

export default function GardenPage() {
  return (
    <div className="py-2">
      <GardenRoom />
    </div>
  );
}
