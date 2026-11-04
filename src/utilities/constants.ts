// Cookie names used by the API client and middleware (keep in sync)
export const AUTH_COOKIE_NAMES = {
  token: "auth_token",
  refreshToken: "refresh_token",
} as const;

// Environment — add keys here only when something in the app imports them
export const ENV_VARS = {
  API_URL:
    process.env.NEXT_PUBLIC_API_URL || "https://api.spinlivepro.com/api/v1",
  /** Payments are disabled in the UI when this is empty. */
  STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "",
} as const;

/** T&C version sent at sign-up; bump with the terms page's "last updated" date. */
export const TERMS_VERSION = "2026-09-19";

export const BASE_PATHS = {
  USER_SERVICE: "/users",
  STREAMS_SERVICE: "/streams",
  AUTH_SERVICE: "/auth",
  NOTIFICATION_SERVICE: "/notification",
  BOOKINGS_SERVICE: "/bookings",
  CHAT_SERVICE: "/chat",
  PAYMENTS_SERVICE: "/payments",
};
