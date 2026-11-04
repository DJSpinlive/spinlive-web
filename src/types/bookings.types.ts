export interface GetBookingsParams {
  djId?: string;
  fanId?: string;
  status?:
    | "pending_dj_review"
    | "awaiting_end_user_confirmation"
    | "awaiting_payment"
    | "confirmed"
    | "declined_by_end_user"
    | "declined_by_dj"
    | "cancelled_by_user"
    | "cancelled_by_dj"
    | "cancelled_by_admin"
    | "completed";

  upcoming?: boolean;
  past?: boolean;
  today?: boolean;
  /** IANA zone used by the date filters; API defaults to UTC. */
  timezone?: string;
}

export interface Booking {
  id: string;
  endUserId: string;
  djId: string;
  endUserDisplayName: string;
  djDisplayName: string;
  djAvatarUrl: string | null;
  status:
    | "pending_dj_review"
    | "awaiting_end_user_confirmation"
    | "awaiting_payment"
    | "confirmed"
    | "declined_by_end_user"
    | "declined_by_dj"
    | "cancelled_by_user"
    | "cancelled_by_dj"
    | "cancelled_by_admin"
    | "completed";
  eventType: string;
  eventDate: string;
  /** Local time on `eventDate`, e.g. `"13:00:00"`. */
  startTime: string;
  /** Local time on `eventDate`, e.g. `"17:00:00"`. */
  endTime: string;
  timezone: string;
  locationType: "virtual" | "venue" | "hybrid" | "in_person";
  venueName: string;
  venueAddress: string;
  genreNotes: string | null;
  specialRequests: string | null;
  guestCount: number;
  budgetAmount: number;
  quotedAmount: number | null;
  finalAmount: number | null;
  depositAmount: number | null;
  currency: string;
  cancellationReason: string | null;
  lastStatusNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  fanId: string;
  djId: string;
  eventType: string;
  eventDate: string; // e.g., "2026-05-05"
  /** Local time on `eventDate`, e.g. `"18:00:00"`. */
  startTime: string;
  /** Local time on `eventDate`, e.g. `"22:00:00"`. */
  endTime: string;
  timezone: string;
  locationType: "virtual" | "venue" | "hybrid";
  venueName: string;
  venueAddress: string;
  genreNotes: string;
  specialRequests: string;
  guestCount: number;
  budgetAmount: number;
  currency: string;
}

export type GetBookingsResponse = Booking[];

export interface BookingHistoryEntry {
  id: number;
  fromStatus: Booking["status"] | null;
  toStatus: Booking["status"];
  changedByUserId: string | null;
  changedByRole: string | null;
  note: string | null;
  createdAt: string;
}

/** Per-booking review (booking svc); separate from the DJ-level rating in the user svc. */
export interface BookingReview {
  id: string;
  bookingId: string;
  djId: string;
  reviewerId: string;
  reviewerDisplayName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingReviewRequest {
  bookingId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface BlockedSlot {
  id: number;
  /** Time of day, "HH:MM:SS". */
  startTime: string;
  /** Time of day, "HH:MM:SS". */
  endTime: string;
  reason: string;
}

export interface AvailabilityWindow {
  /** Time of day, "HH:MM:SS". */
  startTime: string;
  /** Time of day, "HH:MM:SS". */
  endTime: string;
}

export interface BookingAvailability {
  djId: string;
  date: string; // e.g., "2026-05-07"
  hasBookings: boolean;
  availableSlots: AvailabilityWindow[];
  bookedSlots: AvailabilityWindow[];
  blockedSlots: BlockedSlot[];
}
