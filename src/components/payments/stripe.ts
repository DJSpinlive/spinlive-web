import { loadStripe, type Stripe } from "@stripe/stripe-js";

import { ENV_VARS } from "@/utilities/constants";

export const isStripeConfigured = ENV_VARS.STRIPE_PUBLISHABLE_KEY.length > 0;

export const STRIPE_NOT_CONFIGURED_MESSAGE =
  "Payments are not available right now. Please try again later.";

let stripePromise: Promise<Stripe | null> | null = null;

/** Loads Stripe.js once; resolves to null when no publishable key is set. */
export function getStripe(): Promise<Stripe | null> {
  if (!isStripeConfigured) return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = loadStripe(ENV_VARS.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

/** e.g. (1250, "usd") -> "$12.50" */
export function formatMinorAmount(
  amountMinor: number | null | undefined,
  currency: string | null | undefined
): string {
  if (amountMinor == null || Number.isNaN(amountMinor)) return "—";
  const code = (currency || "USD").toUpperCase();
  try {
    const { maximumFractionDigits = 2 } = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).resolvedOptions();
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(amountMinor / 10 ** maximumFractionDigits);
  } catch {
    return `${code} ${(amountMinor / 100).toFixed(2)}`;
  }
}

/** Unique per payment attempt, for the `Idempotency-Key` header. */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
