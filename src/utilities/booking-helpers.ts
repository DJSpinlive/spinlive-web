import type { Booking } from "@/types/bookings.types";

export type BookingListTab = "upcoming" | "pending" | "past";

const PENDING: Booking["status"][] = [
  "pending_dj_review",
  "awaiting_end_user_confirmation",
];

const PAST_STATUSES: Booking["status"][] = [
  "completed",
  "declined_by_end_user",
  "declined_by_dj",
  "cancelled_by_user",
  "cancelled_by_dj",
  "cancelled_by_admin",
];

export function parseBookingStart(b: Booking): Date {
  const [y, m, d] = b.eventDate.split("-").map(Number);
  return new Date(
    y,
    (m ?? 1) - 1,
    d ?? 1,
    b.startTime.hour,
    b.startTime.minute,
    b.startTime.second
  );
}

export function parseBookingEnd(b: Booking): Date {
  const start = parseBookingStart(b);
  const end = new Date(start);
  end.setHours(b.endTime.hour, b.endTime.minute, b.endTime.second, 0);
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }
  return end;
}

export function bookingListTab(b: Booking, now = new Date()): BookingListTab {
  if (PENDING.includes(b.status)) {
    return "pending";
  }
  if (PAST_STATUSES.includes(b.status)) {
    return "past";
  }
  if (b.status === "confirmed") {
    return parseBookingEnd(b) < now ? "past" : "upcoming";
  }
  return "past";
}

export function humanizeEventType(eventType: string): string {
  const t = eventType.trim();
  if (!t) return "Event";
  return t.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function formatBookingDateTile(b: Booking): {
  month: string;
  day: string;
} {
  const d = parseBookingStart(b);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate().toString().padStart(2, "0"),
  };
}

export function formatBookingTimeRange(b: Booking): string {
  const a = parseBookingStart(b);
  const z = parseBookingEnd(b);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return `${a.toLocaleTimeString("en-US", opts)} – ${z.toLocaleTimeString("en-US", opts)}`;
}

export function formatBookingWhenLine(b: Booking): string {
  const d = parseBookingStart(b);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatBookingLocation(b: Booking): string {
  if (b.locationType === "virtual") {
    const v = b.venueName?.trim() || b.venueAddress?.trim();
    return v || "Virtual";
  }
  const name = b.venueName?.trim();
  const addr = b.venueAddress?.trim();
  if (name && addr) return `${name}, ${addr}`;
  return name || addr || "Location TBD";
}

export function formatBookingMoney(amount: number, currency: string): string {
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export type BookingUiStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";

export function bookingUiStatus(b: Booking): BookingUiStatus {
  if (PENDING.includes(b.status)) return "pending";
  if (b.status === "confirmed") return "confirmed";
  if (b.status === "completed") return "completed";
  return "cancelled";
}

export function bookingStatusHeadline(b: Booking): string {
  switch (b.status) {
    case "pending_dj_review":
      return "Awaiting DJ";
    case "awaiting_end_user_confirmation":
      return "Awaiting your confirmation";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "declined_by_end_user":
      return "Declined";
    case "declined_by_dj":
      return "Declined by DJ";
    case "cancelled_by_user":
      return "Cancelled";
    case "cancelled_by_dj":
      return "Cancelled by DJ";
    case "cancelled_by_admin":
      return "Cancelled";
    default:
      return b.status;
  }
}

export function inferLocationType(
  location: string
): "virtual" | "venue" | "hybrid" {
  const l = location.toLowerCase();
  if (
    /https?:\/\//.test(l) ||
    l.includes("zoom") ||
    l.includes("meet.google") ||
    l.includes("teams.microsoft") ||
    l.includes("hybrid")
  ) {
    return "virtual";
  }
  return "venue";
}

export function buildTimeParts(d: Date): {
  hour: number;
  minute: number;
  second: number;
  nano: number;
} {
  return {
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    nano: 0,
  };
}

export function toBookingEventDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const CANCELLABLE: Booking["status"][] = [
  "pending_dj_review",
  "awaiting_end_user_confirmation",
  "confirmed",
];

export function bookingCanCancel(b: Booking): boolean {
  return CANCELLABLE.includes(b.status);
}
