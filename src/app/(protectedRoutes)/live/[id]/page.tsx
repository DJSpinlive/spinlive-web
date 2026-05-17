"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useDjDetailQuery, useGetStreamQuery } from "@/store/api";

const chatMessages = [
  {
    id: "1",
    user: "Emma_G",
    message: "This transition is insane 🔥",
    isTip: false,
  },
  {
    id: "2",
    user: "MarcusV",
    message: "Play some Daft Punk next!",
    isTip: false,
  },
  {
    id: "3",
    user: "SarahB",
    message: "tipped $5.00!",
    isTip: true,
  },
  {
    id: "4",
    user: "Lena",
    message: "Yesss, loving the vibes here",
    isTip: false,
  },
  {
    id: "5",
    user: "DJ_Fan99",
    message: "Amazing set tonight!",
    isTip: false,
  },
  {
    id: "6",
    user: "NightOwl",
    message: "tipped $10.00!",
    isTip: true,
  },
];

export default function LiveDetailsPage() {
  const params = useParams<{ id: string }>();
  const [chatInput, setChatInput] = useState("");
  const streamId = params?.id || "";
  const { data: stream } = useGetStreamQuery(streamId, {
    skip: !streamId,
  });
  const { data: dj } = useDjDetailQuery(stream?.dj_user_id || "", {
    skip: !stream?.dj_user_id,
  });

  const streamImage =
    "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1600&auto=format&fit=crop";
  const streamViewers = stream?.peak_listeners
    ? stream.peak_listeners.toLocaleString()
    : "0";
  const djName = stream?.dj_name || dj?.display_name || "Live DJ";
  const djAvatar =
    dj?.avatar_url ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop";

  return (
    <div className="pb-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/live"
          className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
        >
          ← Back to Live
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-[#1e2536]">
            <div className="relative aspect-video">
              <Image
                src={streamImage}
                alt="Live stream"
                fill
                className="object-cover"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

              <div className="absolute left-4 top-4 flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-md bg-[#ef4444] px-2.5 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  <span className="text-xs font-bold uppercase tracking-wide text-white">
                    Live
                  </span>
                </span>
                <span className="rounded-md bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                  👥 {streamViewers} watching
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-md">
                  <span className="text-sm text-white/70">📌</span>
                  <span className="text-sm text-white/90">
                    Pinned: Drop your song requests! 🎵
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#1e2536] bg-[#0d1117] p-4">
            <div className="flex items-center gap-3">
              <Image
                src={djAvatar}
                alt={djName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-[#1e2536]"
                unoptimized
              />
              <div>
                <h1 className="text-lg font-semibold text-white">{djName}</h1>
                <p className="text-sm text-[#6b7280]">
                  {dj?.genres?.length
                    ? dj.genres.join(" • ")
                    : "Live • Electronic"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={
                  stream?.dj_user_id ? `/djs/${stream.dj_user_id}/book` : "/djs"
                }
                className="rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c4ddb]"
              >
                Book DJ
              </Link>
              <button
                type="button"
                className="rounded-xl border border-[#1e2536] bg-[#0d1117] px-5 py-2.5 text-sm font-medium text-white transition hover:border-[#2d3548]"
              >
                Follow
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-[#1e2536] bg-[#0d1117]">
          <div className="border-b border-[#1e2536] p-4">
            <h2 className="text-base font-semibold text-white">Live Chat</h2>
            <p className="text-xs text-[#6b7280]">
              {streamViewers} viewers in chat
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {chatMessages.map((msg) =>
              msg.isTip ? (
                <div
                  key={msg.id}
                  className="flex items-center gap-2 rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-2.5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8b5cf6] text-xs">
                    🎁
                  </span>
                  <span className="text-sm text-white">
                    <strong className="font-semibold text-[#c4b5fd]">
                      {msg.user}
                    </strong>{" "}
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-semibold text-white">
                    {msg.user[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6b7280]">
                      {msg.user}
                    </p>
                    <p className="text-sm text-white">{msg.message}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border-t border-[#1e2536] p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border border-[#1e2536] bg-[#070b12] px-4 py-3">
                <input
                  type="text"
                  placeholder="Say something..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#4b5563]"
                />
              </div>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1e2536] bg-[#070b12] text-lg transition hover:border-[#2d3548]"
                aria-label="Request song"
              >
                🎵
              </button>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] py-3 text-sm font-semibold text-white transition hover:bg-[#7c4ddb]"
            >
              🎁 Send a Tip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
