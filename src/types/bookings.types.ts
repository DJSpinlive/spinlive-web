export interface GetBookingsParams {
  djId?: string;
  fanId?: string;
  status?:
    | "pending_dj_review"
    | "awaiting_end_user_confirmation"
    | "confirmed"
    | "declined_by_end_user"
    | "declined_by_dj"
    | "cancelled_by_user"
    | "cancelled_by_dj"
    | "cancelled_by_admin"
    | "completed";

  upcoming?: boolean;
  past?: boolean;
}

export interface Booking {
  id: string;
  endUserId: string;
  djId: string;
  endUserDisplayName: string;
  djDisplayName: string;
  djAvatarUrl: string;
  status:
    | "pending_dj_review"
    | "awaiting_end_user_confirmation"
    | "confirmed"
    | "declined_by_end_user"
    | "declined_by_dj"
    | "cancelled_by_user"
    | "cancelled_by_dj"
    | "cancelled_by_admin"
    | "completed";
  eventType: string;
  eventDate: string; // e.g., "2026-05-05"
  startTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  endTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  timezone: string;
  locationType: "virtual" | "in_person";
  venueName: string;
  venueAddress: string;
  genreNotes: string;
  specialRequests: string;
  guestCount: number;
  budgetAmount: number;
  quotedAmount: number;
  finalAmount: number;
  depositAmount: number;
  currency: string;
  cancellationReason: string;
  lastStatusNote: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateBookingRequest {
  fanId: string;
  djId: string;
  eventType: string;
  eventDate: string; // e.g., "2026-05-05"
  startTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  endTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
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
