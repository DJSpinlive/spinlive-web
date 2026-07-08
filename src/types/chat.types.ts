/**
 * SpinLive chat protocol types — see spinlive-chat-flow.md.
 * WS auth is ticket-exchange; role is server-derived from stream.dj_user_id.
 */

export type ChatRole = "DJ" | "FAN";

/** POST /chat/ws/ticket */
export interface ChatTicketRequest {
  room_id: string;
  /** Absolute override from stream/token responses (chat_ticket_url). */
  ticket_url?: string;
}

export interface ChatTicketResponse {
  ticket: string;
  ws_url: string;
  role: ChatRole;
}

/** POST /streams/{id}/token — public, no auth */
export interface StreamTokenRequest {
  stream_id: string;
  user_id: string;
  display_name: string;
}

export interface StreamTokenResponse {
  token: string;
  livekit_url: string;
  hls_url?: string;
  chat_ticket_url?: string;
  chat_ws_url?: string;
}

/** Every frame, both directions */
export interface ChatEnvelope<T = unknown> {
  type: string;
  payload: T;
  request_id?: string;
}

// ── Client → Server payloads ────────────────────────────────────────────────

export interface ChatSendPayload {
  body: string;
}

export interface RequestSubmitPayload {
  title: string;
  artist?: string;
  note?: string;
}

// ── Server → Client payloads ────────────────────────────────────────────────

export interface ChatMessagePayload {
  id: string;
  user_id: string;
  user_name: string;
  body: string;
  created_at: string;
}

export interface TipNotificationPayload {
  room_id: string;
  from_user: string;
  from_name: string;
  amount: string;
  currency: string;
  message?: string;
}

export interface RequestStatusPayload {
  id: string;
  reason?: string;
}

export interface RoomClosedPayload {
  room_id: string;
}

export type ChatErrorCode =
  | "rate_limited"
  | "forbidden"
  | "unknown_type"
  | "not_implemented"
  | "internal";

export interface ChatErrorPayload {
  code: ChatErrorCode;
  message: string;
}

// ── UI-side models ──────────────────────────────────────────────────────────

/** Unified feed item rendered in the chat panel. */
export type ChatFeedItem =
  | {
      kind: "message";
      id: string;
      userId: string;
      userName: string;
      body: string;
      createdAt: string;
      isOwn: boolean;
    }
  | {
      kind: "tip";
      id: string;
      fromName: string;
      amount: string;
      currency: string;
      message?: string;
    }
  | {
      kind: "system";
      id: string;
      body: string;
    };

/** Tracks a fan's own song request through accept/decline. */
export interface OwnSongRequest {
  requestId: string; // client request_id used for correlation before server id arrives
  serverId?: string;
  title: string;
  artist?: string;
  status: "pending" | "accepted" | "declined";
  reason?: string;
}

export type ChatConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed";
