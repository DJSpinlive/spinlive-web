"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useStreamChat } from "@/hooks";
import {
  useCreateStreamTokenMutation,
  useDjDetailQuery,
  useGetStreamQuery,
  useGetUserQuery,
} from "@/store/api";
import { StreamTokenResponse } from "@/types/chat.types";

import { ChatPanel } from "./_components/ChatPanel";
import { StreamPlayer } from "./_components/StreamPlayer";

export default function LiveDetailsPage() {
  const params = useParams<{ id: string }>();
  const streamId = params?.id || "";

  const { data: stream } = useGetStreamQuery(streamId, { skip: !streamId });
  const { data: dj } = useDjDetailQuery(stream?.dj_user_id || "", {
    skip: !stream?.dj_user_id,
  });
  const { data: me } = useGetUserQuery();

  const [createStreamToken] = useCreateStreamTokenMutation();
  const [streamToken, setStreamToken] = useState<StreamTokenResponse | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const streamEnded = !!stream?.ended_at;

  // Fan LiveKit join token — public endpoint, also returns chat endpoints.
  useEffect(() => {
    if (!streamId || !me?.id || streamEnded) return undefined;
    let stale = false;
    createStreamToken({
      stream_id: streamId,
      user_id: me.id,
      display_name: me.display_name || me.username || me.email,
    })
      .unwrap()
      .then((res) => {
        if (!stale) setStreamToken(res);
      })
      .catch(() => {
        // Playback token failed — chat still connects via default endpoints.
      });
    return () => {
      stale = true;
    };
  }, [
    streamId,
    me?.id,
    me?.display_name,
    me?.username,
    me?.email,
    streamEnded,
    createStreamToken,
  ]);

  const {
    status: chatStatus,
    feed,
    lastTip,
    roomClosed,
    error: chatError,
    clearError: clearChatError,
    sendMessage,
    submitRequest,
  } = useStreamChat({
    roomId: streamId,
    currentUserId: me?.id,
    ticketUrl: streamToken?.chat_ticket_url,
    wsUrl: streamToken?.chat_ws_url,
    enabled: !!streamId && !!me?.id && !streamEnded,
  });

  const isEnded = streamEnded || roomClosed;

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
            <StreamPlayer
              livekitUrl={streamToken?.livekit_url}
              token={streamToken?.token}
              posterUrl={streamImage}
              ended={isEnded}
            />

            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3">
              {isEnded ? (
                <span className="rounded-md bg-[#374151] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Ended
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-md bg-[#ef4444] px-2.5 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  <span className="text-xs font-bold uppercase tracking-wide text-white">
                    Live
                  </span>
                </span>
              )}
              <span className="rounded-md bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                👥 {streamViewers} watching
              </span>
            </div>

            {lastTip ? (
              <div className="pointer-events-none absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[#8b5cf6]/80 px-3 py-2 backdrop-blur-md">
                  <span className="text-sm">🎁</span>
                  <span className="text-sm font-medium text-white">
                    {lastTip.from_name} tipped{" "}
                    {lastTip.currency === "USD" ? "$" : `${lastTip.currency} `}
                    {lastTip.amount}
                    {lastTip.message ? ` — “${lastTip.message}”` : ""}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {roomClosed ? (
            <div className="rounded-xl border border-[#1e2536] bg-[#0d1117] p-4 text-center">
              <p className="text-sm text-[#8b95b0]">
                This stream has ended. Thanks for tuning in! 🎧
              </p>
            </div>
          ) : null}

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

        <ChatPanel
          status={chatStatus}
          feed={feed}
          error={chatError}
          onClearError={clearChatError}
          onSendMessage={sendMessage}
          onSubmitRequest={submitRequest}
          onTip={() => showToast("Tipping is coming soon 🎁")}
        />
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[#1e2536] bg-[#0d1117] px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
