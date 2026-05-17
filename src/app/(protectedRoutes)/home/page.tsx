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

const fallbackLiveStreams: LiveStream[] = [
  {
    id: "1",
    title: "Live Session",
    djName: "Guest DJ",
    genre: "All Genres",
    viewers: 0,
    rating: 4.8,
    thumbnail:
      "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?q=80&w=800&auto=format&fit=crop",
  },
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

  const liveStreams = (
    allLiveStreams.length ? allLiveStreams : fallbackLiveStreams
  )
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
          alt="DJ performing in front of crowd"
          width={1600}
          height={520}
          className="h-[320px] w-full object-cover brightness-90 md:h-[400px]"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/80 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-md bg-[#ef4444] px-2.5 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="text-xs font-semibold uppercase tracking-wide text-white">
                Live now
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              1.2k tuning in
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="hidden h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] ring-2 ring-white/20 sm:flex">
                <span className="text-lg font-bold text-white">DS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white md:text-4xl">
                  {featuredStream?.title ||
                    "No live stream available right now"}
                </h1>
                <p className="mt-1 text-base text-white/70">
                  {featuredStream?.djName || "Check back soon"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={featuredStream ? `/live/${featuredStream.id}` : "/live"}
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
