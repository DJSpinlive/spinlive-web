"use client";

import Link from "next/link";
import { useState } from "react";

import {
  useGetMyFavoriteDjsQuery,
  useGetMyFollowedDjsQuery,
} from "@/store/api";
import type { User } from "@/types/user.types";

import { type DJ, DJCard } from "../../_components/DJCard";

type TabType = "following" | "favorites";

const tabs: { id: TabType; label: string }[] = [
  { id: "following", label: "Following" },
  { id: "favorites", label: "Favourites" },
];

function mapUserToDjCard(user: User): DJ {
  return {
    id: user.id,
    name: user.display_name || "Unnamed DJ",
    avatar: user.avatar_url || undefined,
    genres: user.genres?.length ? user.genres : ["All Genres"],
    rating: user.rating_avg || 0,
    reviewCount: user.rating_count || 0,
    hourlyRate: user.hourly_rate || 0,
  };
}

export default function MyDjsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("following");
  const following = useGetMyFollowedDjsQuery();
  const favorites = useGetMyFavoriteDjsQuery();
  const { data: djs = [], isLoading } =
    activeTab === "following" ? following : favorites;

  return (
    <div className="pb-10">
      <Link
        href="/profile"
        className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
      >
        ← Back to profile
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-white">My DJs</h1>

      <div className="my-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-[#0d1117]"
                : "bg-[#1a2234] text-[#9ca3af] hover:bg-[#242f44] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {djs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e2536] bg-[#0d1117] py-16 text-center">
          <h3 className="mb-1 text-lg font-semibold text-white">
            {isLoading
              ? "Loading…"
              : activeTab === "following"
                ? "You're not following any DJs yet"
                : "No favourite DJs yet"}
          </h3>
          {!isLoading ? (
            <Link
              href="/djs"
              className="mt-4 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c4ddb]"
            >
              Browse DJs
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {djs.map((dj) => (
            <DJCard key={dj.id} dj={mapUserToDjCard(dj)} />
          ))}
        </div>
      )}
    </div>
  );
}
