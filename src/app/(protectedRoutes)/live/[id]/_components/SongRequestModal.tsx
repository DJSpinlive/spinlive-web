"use client";

import { useState } from "react";

import { RequestSubmitPayload } from "@/types/chat.types";

interface SongRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (_payload: RequestSubmitPayload) => boolean;
}

export function SongRequestModal({
  open,
  onClose,
  onSubmit,
}: SongRequestModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [note, setNote] = useState("");
  const [failed, setFailed] = useState(false);

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    const sent = onSubmit({ title, artist, note });
    if (!sent) {
      setFailed(true);
      return;
    }
    setTitle("");
    setArtist("");
    setNote("");
    setFailed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1e2536] bg-[#0d1117] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            🎵 Request a Song
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6b7280] transition hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="song-request-title"
            className="block text-xs font-medium text-[#8b95b0]"
          >
            <span className="mb-1 block">Song title *</span>
            <input
              id="song-request-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="One More Time"
              className="w-full rounded-xl border border-[#1e2536] bg-[#070b12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#4b5563] focus:border-[#8b5cf6]"
            />
          </label>
          <label
            htmlFor="song-request-artist"
            className="block text-xs font-medium text-[#8b95b0]"
          >
            <span className="mb-1 block">Artist</span>
            <input
              id="song-request-artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Daft Punk"
              className="w-full rounded-xl border border-[#1e2536] bg-[#070b12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#4b5563] focus:border-[#8b5cf6]"
            />
          </label>
          <label
            htmlFor="song-request-note"
            className="block text-xs font-medium text-[#8b95b0]"
          >
            <span className="mb-1 block">Note for the DJ</span>
            <input
              id="song-request-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="for my bday 🎂"
              className="w-full rounded-xl border border-[#1e2536] bg-[#070b12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#4b5563] focus:border-[#8b5cf6]"
            />
          </label>
        </div>

        {failed ? (
          <p className="mt-3 text-xs text-[#ef4444]">
            Couldn&apos;t send your request — chat isn&apos;t connected.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="mt-5 w-full rounded-xl bg-[#8b5cf6] py-3 text-sm font-semibold text-white transition hover:bg-[#7c4ddb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send Request
        </button>
      </div>
    </div>
  );
}
