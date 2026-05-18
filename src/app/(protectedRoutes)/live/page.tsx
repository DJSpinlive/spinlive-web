"use client";

import { useState } from "react";

import { useGetStreamsQuery } from "@/store/api";
import type { Stream } from "@/types/streams.types";

import { GenreTabs } from "../_components/GenreTabs";
import { LiveStream, LiveStreamCard } from "../_components/LiveStreamCard";

const genres = [
  "All Genres",
  "House",
  "Techno",
  "Hip Hop",
  "R&B",
  "EDM",
  "Trance",
  "Dubstep",
  "Drum & Bass",
  "Afrobeat",
];

const streamThumbs = [
  "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=800&auto=format&fit=crop",
];

function mapStreamToCard(stream: Stream, index: number): LiveStream {
  return {
    id: stream.id || stream.stream_id,
    title: stream.title || "Live Session",
    djName: stream.dj_name || "Live DJ",
    genre: "Live",
    viewers: stream.peak_listeners || 0,
    rating: 4.8,
    thumbnail: streamThumbs[index % streamThumbs.length],
  };
}

type SortOption = "viewers" | "rating" | "newest";

export default function LiveNowPage() {
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState<SortOption>("viewers");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useGetStreamsQuery();

  const rawLiveStreams = data?.live || [];
  const totalLiveBroadcasts = rawLiveStreams.length;
  const liveStreams = rawLiveStreams.map(mapStreamToCard);

  const filteredStreams = liveStreams
    .filter((stream) => {
      const matchesGenre =
        activeGenre === "All Genres" || stream.genre === activeGenre;
      const matchesSearch =
        stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.djName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "viewers") return b.viewers - a.viewers;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Live Now</h1>
        <p className="mt-1 text-[#6b7280]">
          {isLoading
            ? "Loading streams..."
            : totalLiveBroadcasts === 0
              ? "Nothing live right now"
              : `${totalLiveBroadcasts} stream${totalLiveBroadcasts === 1 ? "" : "s"} currently live`}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-11 w-full max-w-md items-center gap-2 rounded-xl border border-[#1e2536] bg-[#0d1117] px-4">
          <svg
            className="h-4 w-4 text-[#6b7280]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search streams or DJs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#4b5563]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6b7280]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-[#1e2536] bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1]"
          >
            <option value="viewers">Most Viewers</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <GenreTabs
        genres={genres}
        activeGenre={activeGenre}
        onGenreChange={setActiveGenre}
      />

      {filteredStreams.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStreams.map((stream) => (
            <LiveStreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e2536] bg-[#0d1117] py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e2536]">
            <svg
              className="h-8 w-8 text-[#6b7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">
            {isLoading
              ? "Loading streams..."
              : totalLiveBroadcasts === 0
                ? "No streams available"
                : "No matching streams"}
          </h3>
          <p className="mx-auto mt-2 max-w-md px-6 text-center text-sm text-[#6b7280]">
            {isLoading && "Fetching live sessions for you."}
            {!isLoading && totalLiveBroadcasts === 0 && (
              <>
                No DJs are broadcasting live right now. You can browse past
                activity from your DJs or explore bookings instead.
              </>
            )}
            {!isLoading &&
              totalLiveBroadcasts > 0 &&
              "Try adjusting your genre filter or search to find live sessions."}
          </p>
        </div>
      )}
    </div>
  );
}
