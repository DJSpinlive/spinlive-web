"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useCreateChatTicketMutation } from "@/store/api";
import {
  ChatConnectionStatus,
  ChatEnvelope,
  ChatErrorPayload,
  ChatFeedItem,
  ChatMessagePayload,
  ChatRole,
  OwnSongRequest,
  RequestStatusPayload,
  RequestSubmitPayload,
  TipNotificationPayload,
} from "@/types/chat.types";

const MAX_FEED_ITEMS = 200;
const MAX_RECONNECT_ATTEMPTS = 5;

interface UseStreamChatOptions {
  /** Chat room id — the stream id. */
  roomId: string;
  /** Current viewer's user id, used to flag own messages. */
  currentUserId?: string;
  /** Absolute ticket endpoint from the stream/token response, if provided. */
  ticketUrl?: string;
  /** Fallback ws url from the stream/token response (ticket response wins). */
  wsUrl?: string;
  /** Connect only when true (e.g. stream is live and user is loaded). */
  enabled?: boolean;
}

interface UseStreamChatResult {
  status: ChatConnectionStatus;
  role: ChatRole | null;
  feed: ChatFeedItem[];
  ownRequests: OwnSongRequest[];
  lastTip: TipNotificationPayload | null;
  roomClosed: boolean;
  error: ChatErrorPayload | null;
  clearError: () => void;
  sendMessage: (_body: string) => boolean;
  submitRequest: (_payload: RequestSubmitPayload) => boolean;
}

function reconnectDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 15000);
}

/**
 * Fan-side chat socket per spinlive-chat-flow.md: exchanges the JWT for a
 * single-use ticket, dials the WS, and reconnects with a fresh ticket on
 * unexpected drops. Role is server-derived — DJ frames simply never arrive
 * for fans.
 */
export function useStreamChat({
  roomId,
  currentUserId,
  ticketUrl,
  wsUrl,
  enabled = true,
}: UseStreamChatOptions): UseStreamChatResult {
  const [createChatTicket] = useCreateChatTicketMutation();

  const [status, setStatus] = useState<ChatConnectionStatus>("idle");
  const [role, setRole] = useState<ChatRole | null>(null);
  const [feed, setFeed] = useState<ChatFeedItem[]>([]);
  const [ownRequests, setOwnRequests] = useState<OwnSongRequest[]>([]);
  const [lastTip, setLastTip] = useState<TipNotificationPayload | null>(null);
  const [roomClosed, setRoomClosed] = useState(false);
  const [error, setError] = useState<ChatErrorPayload | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const closedByUsRef = useRef(false);
  const roomClosedRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  const appendFeed = useCallback((item: ChatFeedItem) => {
    setFeed((prev) => {
      const next = [...prev, item];
      return next.length > MAX_FEED_ITEMS
        ? next.slice(next.length - MAX_FEED_ITEMS)
        : next;
    });
  }, []);

  const resolveOwnRequest = useCallback(
    (
      payload: RequestStatusPayload,
      requestId: string | undefined,
      accepted: boolean
    ) => {
      setOwnRequests((prev) => {
        // Correlate by echoed request_id when present, else oldest pending.
        const index = requestId
          ? prev.findIndex((r) => r.requestId === requestId)
          : prev.findIndex((r) => r.status === "pending");
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = {
          ...next[index],
          serverId: payload.id,
          status: accepted ? "accepted" : "declined",
          reason: payload.reason,
        };
        return next;
      });
    },
    []
  );

  const handleFrame = useCallback(
    (frame: ChatEnvelope) => {
      switch (frame.type) {
        case "chat.message": {
          const p = frame.payload as ChatMessagePayload;
          appendFeed({
            kind: "message",
            id: p.id,
            userId: p.user_id,
            userName: p.user_name,
            body: p.body,
            createdAt: p.created_at,
            isOwn:
              !!currentUserIdRef.current &&
              p.user_id === currentUserIdRef.current,
          });
          break;
        }
        case "tip.notification": {
          const p = frame.payload as TipNotificationPayload;
          setLastTip(p);
          appendFeed({
            kind: "tip",
            id: uuidv4(),
            fromName: p.from_name,
            amount: p.amount,
            currency: p.currency,
            message: p.message,
          });
          break;
        }
        case "request.accepted": {
          const p = frame.payload as RequestStatusPayload;
          resolveOwnRequest(p, frame.request_id, true);
          appendFeed({
            kind: "system",
            id: uuidv4(),
            body: "🎶 Your song request is up!",
          });
          break;
        }
        case "request.declined": {
          const p = frame.payload as RequestStatusPayload;
          resolveOwnRequest(p, frame.request_id, false);
          appendFeed({
            kind: "system",
            id: uuidv4(),
            body: p.reason
              ? `Your song request was declined — ${p.reason}`
              : "Your song request was declined",
          });
          break;
        }
        case "room_closed": {
          // Control-plane: this socket's room is draining — no reconnect.
          roomClosedRef.current = true;
          setRoomClosed(true);
          break;
        }
        case "error": {
          setError(frame.payload as ChatErrorPayload);
          break;
        }
        default:
          // Unknown server frame — ignore per forward-compat.
          break;
      }
    },
    [appendFeed, resolveOwnRequest]
  );

  const handleFrameRef = useRef(handleFrame);
  handleFrameRef.current = handleFrame;

  useEffect(() => {
    if (!enabled || !roomId) {
      setStatus("idle");
      return undefined;
    }

    closedByUsRef.current = false;
    roomClosedRef.current = false;
    attemptsRef.current = 0;
    setRoomClosed(false);

    let cancelled = false;

    // Mutable holder breaks the connect ⇄ scheduleReconnect cycle.
    const retry: { schedule: () => void } = { schedule: () => undefined };

    async function connect(isReconnect: boolean) {
      if (cancelled) return;
      setStatus(isReconnect ? "reconnecting" : "connecting");

      let ticket: string;
      let socketUrl: string | undefined;
      try {
        const res = await createChatTicket({
          room_id: roomId,
          ticket_url: ticketUrl,
        }).unwrap();
        ticket = res.ticket;
        socketUrl = res.ws_url ?? wsUrl;
        setRole(res.role);
      } catch {
        retry.schedule();
        return;
      }

      if (cancelled || !socketUrl) {
        if (!socketUrl) setStatus("closed");
        return;
      }

      const separator = socketUrl.includes("?") ? "&" : "?";
      const ws = new WebSocket(
        `${socketUrl}${separator}ticket=${encodeURIComponent(ticket)}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        attemptsRef.current = 0;
        setStatus("open");
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          handleFrameRef.current(JSON.parse(event.data) as ChatEnvelope);
        } catch {
          // Non-JSON frame — ignore.
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        wsRef.current = null;
        if (closedByUsRef.current || roomClosedRef.current) {
          setStatus("closed");
          return;
        }
        retry.schedule();
      };
    }

    retry.schedule = () => {
      if (cancelled || roomClosedRef.current) return;
      if (attemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setStatus("closed");
        return;
      }
      const delay = reconnectDelay(attemptsRef.current);
      attemptsRef.current += 1;
      setStatus("reconnecting");
      reconnectTimerRef.current = setTimeout(() => connect(true), delay);
    };

    connect(false);

    return () => {
      cancelled = true;
      closedByUsRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "client navigated away");
        wsRef.current = null;
      }
    };
  }, [enabled, roomId, ticketUrl, wsUrl, createChatTicket]);

  const sendFrame = useCallback(
    (type: string, payload: unknown): string | null => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return null;
      const requestId = uuidv4();
      ws.send(JSON.stringify({ type, payload, request_id: requestId }));
      return requestId;
    },
    []
  );

  const sendMessage = useCallback(
    (body: string): boolean => {
      const trimmed = body.trim();
      if (!trimmed) return false;
      return sendFrame("chat.send", { body: trimmed }) !== null;
    },
    [sendFrame]
  );

  const submitRequest = useCallback(
    (payload: RequestSubmitPayload): boolean => {
      const title = payload.title.trim();
      if (!title) return false;
      const requestId = sendFrame("request.submit", {
        title,
        ...(payload.artist?.trim() ? { artist: payload.artist.trim() } : {}),
        ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
      });
      if (!requestId) return false;
      setOwnRequests((prev) => [
        ...prev,
        { requestId, title, artist: payload.artist, status: "pending" },
      ]);
      return true;
    },
    [sendFrame]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    status,
    role,
    feed,
    ownRequests,
    lastTip,
    roomClosed,
    error,
    clearError,
    sendMessage,
    submitRequest,
  };
}
