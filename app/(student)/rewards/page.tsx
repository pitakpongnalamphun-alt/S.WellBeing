"use client";

import { useState } from "react";

import { GachaMachine } from "@/components/gacha/GachaMachine";
import { CozyShop } from "@/components/gacha/CozyShop";
import { FriendsCollection } from "@/components/gacha/FriendsCollection";
import { StarBar } from "@/components/gacha/StarBar";

type Tab = "gacha" | "shop" | "collection";

const TABS: [Tab, string][] = [
  ["gacha", "กาชา"],
  ["shop", "ร้านค้า"],
  ["collection", "คอลเลกชัน"],
];

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>("gacha");

  return (
    <div className="flex flex-1 flex-col gap-4 py-2 pb-24">
      <header className="flex flex-col items-center gap-3 text-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">แก๊งเพื่อนปุย 🧸</h1>
          <p className="text-sm text-slate-500">รางวัลเล็ก ๆ ของการดูแลใจตัวเอง</p>
        </div>
        <StarBar />
      </header>

      <div className="mx-auto flex w-full max-w-md rounded-full bg-slate-100 p-1 text-sm font-semibold">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-full py-2 transition ${
              tab === id ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "gacha" ? <GachaMachine /> : tab === "shop" ? <CozyShop /> : <FriendsCollection />}
    </div>
  );
}
