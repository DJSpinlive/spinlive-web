"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useDiscoverDjsQuery, useGetStreamsQuery } from "@/store/api";
import type { Stream } from "@/types/streams.types";
import type { User } from "@/types/user.types";

import { DJ, DJCard } from "../_components/DJCard";
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

const fallbackDjs: DJ[] = [
  {
    id: "1",
    name: "Featured DJ",
    genres: ["All Genres"],
    rating: 4.8,
    reviewCount: 0,
    hourlyRate: 100,
  },
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

function mapDjToCard(dj: User): DJ {
  return {
    id: dj.id,
    name: dj.display_name || "Unnamed DJ",
    avatar: dj.avatar_url || undefined,
    genres: dj.genres?.length ? dj.genres : ["All Genres"],
    rating: dj.rating_avg || 0,
    reviewCount: dj.rating_count || 0,
    hourlyRate: dj.hourly_rate || 0,
  };
}

export default function HomePage() {
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const { data: streamsData, isLoading: streamsLoading } = useGetStreamsQuery();
  const { data: djsData, isLoading: djsLoading } = useDiscoverDjsQuery({
    limit: 12,
    offset: 0,
  });

  const allLiveStreams = (streamsData?.live || []).map(mapStreamToCard);
  const allDjs = (djsData?.djs || []).map(mapDjToCard);

  const liveStreams = allLiveStreams
    .filter(
      (stream) =>
        activeGenre === "All Genres" ||
        stream.genre.toLowerCase().includes(activeGenre.toLowerCase()) ||
        stream.title.toLowerCase().includes(activeGenre.toLowerCase())
    )
    .slice(0, 4);

  const djs = (allDjs.length ? allDjs : fallbackDjs)
    .filter(
      (dj) =>
        activeGenre === "All Genres" ||
        dj.genres.some((genre) =>
          genre.toLowerCase().includes(activeGenre.toLowerCase())
        )
    )
    .slice(0, 4);

  const featuredStream = liveStreams[0];

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl">
        <Image
          src="https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1600&auto=format&fit=crop"
          alt=""
          width={1600}
          height={520}
          className={`h-[320px] w-full object-cover md:h-[400px] ${streamsLoading || featuredStream ? "brightness-90" : "brightness-[0.35]"}`}
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/80 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          {streamsLoading ? (
            <div className="space-y-3">
              <div className="h-8 w-48 animate-pulse rounded-md bg-white/10" />
              <div className="h-12 w-full max-w-xl animate-pulse rounded-md bg-white/10 md:h-14" />
              <div className="h-10 w-full max-w-sm animate-pulse rounded-md bg-white/5" />
            </div>
          ) : featuredStream ? (
            <>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-md bg-[#ef4444] px-2.5 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-white">
                    Live now
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {featuredStream.viewers > 0
                    ? `${featuredStream.viewers.toLocaleString()} tuning in`
                    : "Live — be first to tune in"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="hidden h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] ring-2 ring-white/20 sm:flex">
                    <span className="text-lg font-bold text-white">●</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white md:text-4xl">
                      {featuredStream.title}
                    </h1>
                    <p className="mt-1 text-base text-white/70">
                      {featuredStream.djName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/live/${featuredStream.id}`}
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#070b12] transition hover:bg-white/90"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Join Stream
                  </Link>
                  <Link
                    href={djs[0] ? `/djs/${djs[0].id}/book` : "/djs"}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Book DJ
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-[#2d3548] bg-[#0d1117]/80 backdrop-blur-sm">
                  <svg
                    className="h-7 w-7 text-[#6b7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="inline-flex rounded-md border border-[#334155] bg-[#0d1117]/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#94a3b8] backdrop-blur-sm">
                    Nothing live right now
                  </span>
                  <h1 className="mt-4 text-2xl font-bold text-white md:text-4xl">
                    No streams available
                  </h1>
                  <p className="mt-2 max-w-lg text-base leading-relaxed text-white/60">
                    When a DJ starts a broadcast, it will appear here. You can
                    still browse DJs and book ahead.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/live"
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Live hub
                </Link>
                <Link
                  href={djs[0] ? `/djs/${djs[0].id}/book` : "/djs"}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#070b12] transition hover:bg-white/90"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Book a DJ
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <GenreTabs
        genres={genres}
        activeGenre={activeGenre}
        onGenreChange={setActiveGenre}
      />

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Live Now</h2>
          <Link
            href="/live"
            className="text-sm font-medium text-[#8b5cf6] transition hover:text-[#a78bfa]"
          >
            View All Streams
          </Link>
        </div>

        {streamsLoading ? (
          <p className="text-sm text-[#9ca3af]">Loading live streams...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {liveStreams.map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Available for Booking
          </h2>
          <Link
            href="/djs"
            className="text-sm font-medium text-[#8b5cf6] transition hover:text-[#a78bfa]"
          >
            View All DJs
          </Link>
        </div>

        {djsLoading ? (
          <p className="text-sm text-[#9ca3af]">Loading DJs...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {djs.map((dj) => (
              <DJCard key={dj.id} dj={dj} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
