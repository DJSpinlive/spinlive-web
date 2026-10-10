import type { DjReview } from "@/types/dj.types";
import type { User } from "@/types/user.types";

export function formatUsdHourly(rate: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: rate % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(rate);
}

/** e.g. 1.2k, 3.5m — for follower / booking counts */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return value.toString();
}

function readNumberField(o: Record<string, unknown>, keys: string[]): number {
  const hit = keys.find((key) => {
    const v = o[key];
    return typeof v === "number" && Number.isFinite(v);
  });
  if (!hit) return 0;
  const v = o[hit];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function followerCountFromUser(dj: User): number {
  return readNumberField(dj as unknown as Record<string, unknown>, [
    "followers_count",
    "follower_count",
  ]);
}

export function bookingCountFromUser(dj: User): number {
  return readNumberField(dj as unknown as Record<string, unknown>, [
    "bookings_count",
    "total_bookings",
    "completed_bookings",
  ]);
}

export function isFollowingFromUser(dj: User | undefined): boolean {
  if (!dj) return false;
  const v = (dj as unknown as Record<string, unknown>).is_following;
  return v === true;
}

export function summarizeAvailability(dj: User): string | null {
  const av = dj.availability;
  if (!Array.isArray(av) || av.length === 0) return null;
  const first = av[0];
  if (!first || typeof first !== "object") return null;
  const o = first as unknown as Record<string, unknown>;
  if (typeof o.label === "string" && o.label.trim()) return o.label.trim();
  if (typeof o.summary === "string" && o.summary.trim()) {
    return o.summary.trim();
  }
  if (typeof o.notes === "string" && o.notes.trim()) return o.notes.trim();
  return null;
}

export function reviewBody(r: DjReview): string {
  const raw = r.comment?.trim() || r.content?.trim() || r.text?.trim() || "";
  return raw;
}

/**
 * Best available name for a reviewer. The reviews endpoint currently returns only
 * `reviewer_id`, so we fall back to a short handle derived from it.
 */
export function reviewAuthorLabel(r: DjReview): string {
  const named =
    r.reviewer_username?.trim() ||
    r.reviewer_display_name?.trim() ||
    r.reviewer_name?.trim() ||
    "";
  if (named) return named.startsWith("@") ? named : `@${named}`;
  const id = r.reviewer_id ?? "";
  return id ? `@user-${id.slice(0, 8)}` : "Reviewer";
}

/** Full reviewer id, shown under the name so reviews are traceable. */
export function reviewAuthorId(r: DjReview): string {
  return r.reviewer_id?.trim() ?? "";
}

/** Stable React key for a review row. */
export function reviewKeyFor(r: DjReview, index: number): string {
  const { id } = r;
  if (typeof id === "number" && Number.isFinite(id)) return `review-${id}`;
  if (typeof id === "string" && id.length > 0) return id;
  return `review-idx-${index}`;
}

/** The signed-in user's review of this DJ, if they have already left one. */
export function findOwnReview(
  reviews: DjReview[],
  currentUserId: string | undefined
): DjReview | undefined {
  if (!currentUserId) return undefined;
  return reviews.find((r) => r.reviewer_id === currentUserId);
}

export function formatReviewDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function reviewStarCount(r: DjReview): number {
  const n = Number(r.rating);
  if (!Number.isFinite(n) || n <= 0) return 5;
  return Math.max(1, Math.min(5, Math.round(n)));
}

/** Prefer HTTPS for remote avatars where possible */
export function toHttpsAvatarUrl(raw: string | undefined | null): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t) return "";
  if (t.startsWith("https://")) return t;
  if (t.startsWith("http://")) return `https://${t.slice("http://".length)}`;
  if (t.startsWith("//")) return `https:${t}`;
  return t;
}

export function djAvatarFallback(djId: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(djId || "spinlive-dj")}/400/400`;
}
