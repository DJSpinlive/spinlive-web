"use client";

import { useState } from "react";

import {
  formatMinorAmount,
  isStripeConfigured,
  STRIPE_NOT_CONFIGURED_MESSAGE,
} from "@/components/payments/stripe";
import { StripeCheckoutModal } from "@/components/payments/stripe-checkout-modal";
import { useGetBookingPaymentQuery, usePayBookingMutation } from "@/store/api";
import type { Booking } from "@/types/bookings.types";
import type { PayBookingResponse } from "@/types/payments.types";
import { formatBookingMoney } from "@/utilities/booking-helpers";
import { getErrorMessage } from "@/utilities/helpers";

interface BookingPaymentCardProps {
  booking: Booking;
  /** Stripe accepted the payment; the booking confirms once the webhook lands. */
  onPaid: () => void;
}

/**
 * "Pay to confirm" for bookings in `awaiting_payment`. The amount comes from the
 * booking server-side; `/pay` is idempotent, so retries reuse the same intent.
 */
export function BookingPaymentCard({
  booking,
  onPaid,
}: BookingPaymentCardProps) {
  const { data: payment } = useGetBookingPaymentQuery(booking.id);
  const [payBooking, { isLoading }] = usePayBookingMutation();
  const [intent, setIntent] = useState<PayBookingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const amountLabel = formatBookingMoney(
    booking.finalAmount ?? booking.quotedAmount ?? booking.budgetAmount,
    booking.currency
  );
  const alreadyPaid =
    payment?.status === "succeeded" || payment?.status === "processing";

  const startPayment = async () => {
    setError(null);
    if (!isStripeConfigured) {
      setError(STRIPE_NOT_CONFIGURED_MESSAGE);
      return;
    }
    try {
      const result = await payBooking({ bookingId: booking.id }).unwrap();
      if (result.status === "succeeded" || result.status === "processing") {
        onPaid();
        return;
      }
      if (!result.clientSecret) {
        setError("Payment could not be started. Please try again.");
        return;
      }
      setIntent(result);
    } catch (e) {
      setError(
        getErrorMessage(e, { fallbackMessage: "Could not start payment." })
      );
    }
  };

  return (
    <section className="rounded-2xl border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 p-5">
      <h2 className="text-lg font-bold text-white">Payment due</h2>
      <p className="mt-1 text-sm text-[#c7d0ff]">
        Pay {amountLabel} to confirm this booking. The DJ&apos;s slot is held
        for you until then.
      </p>

      {alreadyPaid ? (
        <p className="mt-3 text-sm text-emerald-300">
          Payment received, confirming your booking…
        </p>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={startPayment}
          className="mt-4 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
        >
          {isLoading ? "Starting payment…" : `Pay now · ${amountLabel}`}
        </button>
      )}

      {payment?.status === "failed" && !error ? (
        <p className="mt-3 text-sm text-[#fca5a5]">
          Your last payment attempt failed. You can try again with another card.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-[#fca5a5]">
          {error}
        </p>
      ) : null}

      {intent ? (
        <StripeCheckoutModal
          clientSecret={intent.clientSecret}
          mode="payment"
          title="Pay for booking"
          description={`Amount: ${formatMinorAmount(intent.amountMinor, intent.currency)}`}
          submitLabel="Pay"
          onSuccess={() => {
            setIntent(null);
            onPaid();
          }}
          onClose={() => setIntent(null)}
        />
      ) : null}
    </section>
  );
}
