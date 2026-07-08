"use client";

import { ConnectionState, RemoteTrack, Room, RoomEvent } from "livekit-client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PlayerState = "connecting" | "playing" | "failed" | "ended";

interface StreamPlayerProps {
  livekitUrl?: string;
  token?: string;
  posterUrl: string;
  ended?: boolean;
}

/**
 * Fan-side playback: subscribes to the DJ's LiveKit room over WebRTC and
 * attaches whatever tracks arrive (fans never publish).
 */
export function StreamPlayer({
  livekitUrl,
  token,
  posterUrl,
  ended = false,
}: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<PlayerState>("connecting");
  const [muted, setMuted] = useState(true); // autoplay-safe default

  useEffect(() => {
    if (ended) {
      setState("ended");
      return undefined;
    }
    if (!livekitUrl || !token) return undefined;

    let cancelled = false;
    const room = new Room();

    const attachTrack = (track: RemoteTrack) => {
      if (cancelled || !videoRef.current) return;
      track.attach(videoRef.current);
      setState("playing");
    };

    room.on(RoomEvent.TrackSubscribed, attachTrack);
    room.on(RoomEvent.Disconnected, () => {
      if (!cancelled) setState("ended");
    });
    room.on(RoomEvent.ConnectionStateChanged, (connectionState) => {
      if (cancelled) return;
      if (connectionState === ConnectionState.Reconnecting) {
        setState("connecting");
      }
    });

    room
      .connect(livekitUrl, token)
      .then(() => {
        if (cancelled) return;
        // Attach tracks already published before we joined.
        room.remoteParticipants.forEach((participant) => {
          participant.trackPublications.forEach((publication) => {
            if (publication.track) attachTrack(publication.track);
          });
        });
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });

    return () => {
      cancelled = true;
      room.disconnect();
    };
  }, [livekitUrl, token, ended]);

  const showPoster = state !== "playing";

  return (
    <div className="relative aspect-video bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${showPoster ? "hidden" : ""}`}
      />

      {showPoster ? (
        <>
          <Image
            src={posterUrl}
            alt="Live stream"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {state === "ended"
                ? "Stream ended"
                : state === "failed"
                  ? "Couldn't connect to the stream"
                  : "Connecting to stream…"}
            </span>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/80"
        >
          {muted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      )}
    </div>
  );
}
