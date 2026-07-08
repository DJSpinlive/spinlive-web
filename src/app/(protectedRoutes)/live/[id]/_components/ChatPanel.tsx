"use client";

import { useEffect, useRef, useState } from "react";

import {
  ChatConnectionStatus,
  ChatErrorPayload,
  ChatFeedItem,
  RequestSubmitPayload,
} from "@/types/chat.types";

import { SongRequestModal } from "./SongRequestModal";

const STATUS_LABELS: Record<ChatConnectionStatus, string> = {
  idle: "Chat offline",
  connecting: "Connecting…",
  open: "Live chat",
  reconnecting: "Reconnecting…",
  closed: "Chat disconnected",
};

const ERROR_LABELS: Partial<Record<ChatErrorPayload["code"], string>> = {
  rate_limited: "You're sending messages too fast — slow down a little.",
  forbidden: "You can't do that in this room.",
  internal: "Something went wrong — try again.",
};

interface ChatPanelProps {
  status: ChatConnectionStatus;
  feed: ChatFeedItem[];
  error: ChatErrorPayload | null;
  onClearError: () => void;
  onSendMessage: (_body: string) => boolean;
  onSubmitRequest: (_payload: RequestSubmitPayload) => boolean;
  onTip: () => void;
}

function FeedItem({ item }: { item: ChatFeedItem }) {
  if (item.kind === "tip") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] text-xs">
          🎁
        </span>
        <span className="text-sm text-white">
          <strong className="font-semibold text-[#c4b5fd]">
            {item.fromName}
          </strong>{" "}
          tipped {item.currency === "USD" ? "$" : `${item.currency} `}
          {item.amount}!{item.message ? ` — “${item.message}”` : ""}
        </span>
      </div>
    );
  }

  if (item.kind === "system") {
    return (
      <p className="rounded-lg bg-[#1e2536]/50 px-3 py-2 text-center text-xs text-[#8b95b0]">
        {item.body}
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-semibold text-white">
        {(item.userName || "?").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#6b7280]">
          {item.userName}
          {item.isOwn ? " (you)" : ""}
        </p>
        <p className="break-words text-sm text-white">{item.body}</p>
      </div>
    </div>
  );
}

export function ChatPanel({
  status,
  feed,
  error,
  onClearError,
  onSendMessage,
  onSubmitRequest,
  onTip,
}: ChatPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  // Auto-scroll on new items unless the user scrolled up to read history.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [feed]);

  // Rate-limit / server errors auto-dismiss.
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(onClearError, 4000);
    return () => clearTimeout(timer);
  }, [error, onClearError]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  const handleSend = () => {
    if (onSendMessage(chatInput)) {
      setChatInput("");
    }
  };

  const connected = status === "open";

  return (
    <div className="flex min-h-[480px] flex-col rounded-2xl border border-[#1e2536] bg-[#0d1117] lg:max-h-[calc(100vh-8rem)]">
      <div className="border-b border-[#1e2536] p-4">
        <h2 className="text-base font-semibold text-white">Live Chat</h2>
        <p className="flex items-center gap-1.5 text-xs text-[#6b7280]">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              connected
                ? "bg-[#22c55e]"
                : status === "closed" || status === "idle"
                  ? "bg-[#ef4444]"
                  : "animate-pulse bg-[#eab308]"
            }`}
          />
          {STATUS_LABELS[status]}
        </p>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {feed.length === 0 ? (
          <p className="pt-8 text-center text-sm text-[#4b5563]">
            {connected
              ? "No messages yet — say hi 👋"
              : "Chat will appear here once connected."}
          </p>
        ) : (
          feed.map((item) => <FeedItem key={item.id} item={item} />)
        )}
      </div>

      {error ? (
        <div className="mx-4 mb-2 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-2 text-xs text-[#fca5a5]">
          {ERROR_LABELS[error.code] ?? error.message}
        </div>
      ) : null}

      <div className="border-t border-[#1e2536] p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-xl border border-[#1e2536] bg-[#070b12] px-4 py-3">
            <input
              type="text"
              placeholder={connected ? "Say something..." : "Chat offline"}
              value={chatInput}
              disabled={!connected}
              maxLength={500}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#4b5563] disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!connected || !chatInput.trim()}
              className="ml-2 text-sm font-semibold text-[#8b5cf6] transition hover:text-[#c4b5fd] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <button
            type="button"
            onClick={() => setRequestModalOpen(true)}
            disabled={!connected}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1e2536] bg-[#070b12] text-lg transition hover:border-[#2d3548] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Request song"
            title="Request a song"
          >
            🎵
          </button>
        </div>

        <button
          type="button"
          onClick={onTip}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] py-3 text-sm font-semibold text-white transition hover:bg-[#7c4ddb]"
        >
          🎁 Send a Tip
        </button>
      </div>

      <SongRequestModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSubmit={onSubmitRequest}
      />
    </div>
  );
}
