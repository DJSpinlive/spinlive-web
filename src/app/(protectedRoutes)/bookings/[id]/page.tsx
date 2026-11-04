"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useAcceptBookingQuoteMutation,
  useDeclineBookingQuoteMutation,
  useDeleteBookingMutation,
  useGetBookingDetailsQuery,
  useGetBookingHistoryQuery,
} from "@/store/api";
import {
  bookingCanCancel,
  bookingStatusHeadline,
  bookingStatusLabel,
  formatBookingLocation,
  formatBookingMoney,
  formatBookingTimeRange,
  formatBookingWhenLine,
  humanizeEventType,
} from "@/utilities/booking-helpers";
import { getErrorMessage } from "@/utilities/helpers";

import { BookingPaymentCard } from "./_components/BookingPaymentCard";
import { BookingReviewCard } from "./_components/BookingReviewCard";

const CONFIRM_POLL_MS = 2000;
const CONFIRM_TIMEOUT_MS = 60_000;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-[#8b95b0]">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}

function formatHistoryTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = typeof params?.id === "string" ? params.id : "";

  /** Set after Stripe accepts payment; poll until the webhook confirms the booking. */
  const [confirming, setConfirming] = useState(false);
  const [confirmTimedOut, setConfirmTimedOut] = useState(false);

  const {
    data: booking,
    isLoading,
    isError,
    refetch,
  } = useGetBookingDetailsQuery(bookingId, {
    skip: !bookingId,
    pollingInterval: confirming ? CONFIRM_POLL_MS : 0,
  });
  const { data: history = [] } = useGetBookingHistoryQuery(bookingId, {
    skip: !bookingId,
  });

  const [acceptQuote, { isLoading: accepting }] =
    useAcceptBookingQuoteMutation();
  const [declineQuote, { isLoading: declining }] =
    useDeclineBookingQuoteMutation();
  const [cancelBooking, { isLoading: cancelling }] = useDeleteBookingMutation();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (confirming && booking?.status === "confirmed") {
      setConfirming(false);
      setBanner("Payment received. Your booking is confirmed!");
    }
  }, [confirming, booking?.status]);

  useEffect(() => {
    if (!confirming) return undefined;
    const timer = setTimeout(() => {
      setConfirming(false);
      setConfirmTimedOut(true);
    }, CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  const handlePaid = () => {
    setConfirmTimedOut(false);
    setConfirming(true);
  };

  const handleAccept = async () => {
    setBanner(null);
    try {
      await acceptQuote(bookingId).unwrap();
      setBanner("Quote accepted. Pay below to confirm your booking.");
    } catch (e) {
      setBanner(
        getErrorMessage(e, { fallbackMessage: "Could not accept the quote." })
      );
    }
  };

  const handleDecline = async () => {
    if (!window.confirm("Decline this quote? The booking will be closed.")) {
      return;
    }
    setBanner(null);
    try {
      await declineQuote(bookingId).unwrap();
      setBanner("Quote declined.");
    } catch (e) {
      setBanner(
        getErrorMessage(e, { fallbackMessage: "Could not decline the quote." })
      );
    }
  };

  const handleCancel = async () => {
    const reason = cancelReason.trim();
    if (!reason) return;
    try {
      await cancelBooking({ id: bookingId, reason }).unwrap();
      setCancelOpen(false);
      setCancelReason("");
      setBanner("Booking cancelled.");
    } catch (e) {
      setBanner(
        getErrorMessage(e, { fallbackMessage: "Could not cancel booking." })
      );
    }
  };

  const backLink = (
    <Link
      href="/bookings"
      className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
    >
      ← Back to bookings
    </Link>
  );

  if (isLoading) {
    return (
      <div className="pb-10">
        {backLink}
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="pb-10">
        {backLink}
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-bold text-white">Could not load booking</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c3aed]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const quoteAmount = booking.finalAmount ?? booking.quotedAmount;

  return (
    <div className="pb-10">
      {backLink}

      <div className="mx-auto mt-4 max-w-2xl space-y-5">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b5cf6]">
            {bookingStatusHeadline(booking)}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            {humanizeEventType(booking.eventType)} with{" "}
            <Link
              href={`/djs/${booking.djId}`}
              className="underline-offset-2 hover:underline"
            >
              {booking.djDisplayName}
            </Link>
          </h1>
          <p className="mt-1 text-sm text-[#8b95b0]">
            {formatBookingWhenLine(booking)} · {formatBookingTimeRange(booking)}
          </p>
        </header>

        {banner ? (
          <div
            role="status"
            className="rounded-xl border border-[#1e2536] bg-[#0d1117] px-4 py-3 text-sm text-[#e5e7eb]"
          >
            {banner}
          </div>
        ) : null}

        {confirming ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
            Payment received, confirming your booking…
          </div>
        ) : null}

        {confirmTimedOut && booking.status !== "confirmed" ? (
          <div
            role="status"
            className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"
          >
            Confirmation is taking longer than usual. Your payment went through;
            check back soon.
          </div>
        ) : null}

        {booking.status === "awaiting_end_user_confirmation" ? (
          <section className="rounded-2xl border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 p-5">
            <h2 className="text-lg font-bold text-white">
              The DJ sent a quote
            </h2>
            <p className="mt-1 text-2xl font-extrabold text-white">
              {formatBookingMoney(quoteAmount, booking.currency)}
            </p>
            {booking.depositAmount ? (
              <p className="text-sm text-[#c7d0ff]">
                Deposit:{" "}
                {formatBookingMoney(booking.depositAmount, booking.currency)}
              </p>
            ) : null}
            {booking.lastStatusNote ? (
              <p className="mt-2 text-sm text-[#c7d0ff]">
                “{booking.lastStatusNote}”
              </p>
            ) : null}
            <p className="mt-2 text-sm text-[#8b95b0]">
              Accepting takes you to payment. The booking is confirmed once
              payment succeeds.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={accepting || declining}
                onClick={handleAccept}
                className="rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
              >
                {accepting ? "Accepting…" : "Accept quote"}
              </button>
              <button
                type="button"
                disabled={accepting || declining}
                onClick={handleDecline}
                className="rounded-xl border border-[#1e2536] px-5 py-2.5 text-sm font-semibold text-[#e7ecff] transition hover:border-[#f87171] hover:text-[#fca5a5] disabled:opacity-50"
              >
                {declining ? "Declining…" : "Decline"}
              </button>
            </div>
          </section>
        ) : null}

        {booking.status === "awaiting_payment" && !confirming ? (
          <BookingPaymentCard booking={booking} onPaid={handlePaid} />
        ) : null}

        <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-5">
          <h2 className="mb-2 text-lg font-bold text-white">Details</h2>
          <div className="divide-y divide-[#1e2536]">
            <DetailRow
              label="Event"
              value={humanizeEventType(booking.eventType)}
            />
            <DetailRow
              label="When"
              value={`${formatBookingWhenLine(booking)}, ${formatBookingTimeRange(booking)}`}
            />
            <DetailRow label="Where" value={formatBookingLocation(booking)} />
            {booking.guestCount ? (
              <DetailRow label="Guests" value={String(booking.guestCount)} />
            ) : null}
            <DetailRow
              label="Your budget"
              value={formatBookingMoney(booking.budgetAmount, booking.currency)}
            />
            {quoteAmount != null ? (
              <DetailRow
                label={booking.finalAmount != null ? "Price" : "Quote"}
                value={formatBookingMoney(quoteAmount, booking.currency)}
              />
            ) : null}
            {booking.genreNotes ? (
              <DetailRow label="Music" value={booking.genreNotes} />
            ) : null}
            {booking.specialRequests ? (
              <DetailRow label="Requests" value={booking.specialRequests} />
            ) : null}
            {booking.cancellationReason ? (
              <DetailRow
                label="Cancellation reason"
                value={booking.cancellationReason}
              />
            ) : null}
          </div>
        </section>

        {booking.status === "completed" ? (
          <BookingReviewCard bookingId={booking.id} />
        ) : null}

        {history.length > 0 ? (
          <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-5">
            <h2 className="mb-3 text-lg font-bold text-white">Timeline</h2>
            <ol className="space-y-3 border-l border-[#1e2536] pl-4">
              {history.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                  <p className="text-sm font-semibold text-white">
                    {bookingStatusLabel(entry.toStatus)}
                  </p>
                  <p className="text-xs text-[#8b95b0]">
                    {formatHistoryTime(entry.createdAt)}
                    {entry.changedByRole ? ` · by ${entry.changedByRole}` : ""}
                  </p>
                  {entry.note ? (
                    <p className="mt-1 text-sm text-[#c7d0ff]">{entry.note}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {bookingCanCancel(booking) && !confirming ? (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="w-full rounded-xl border border-[#f87171]/40 py-3 text-sm font-semibold text-[#fca5a5] transition hover:bg-[#f87171]/10"
          >
            Cancel booking
          </button>
        ) : null}
      </div>

      {cancelOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#1e2536] bg-[#11193e] p-5 shadow-xl">
            <h2
              id="cancel-booking-title"
              className="mb-2 text-lg font-bold text-white"
            >
              Cancel booking
            </h2>
            <p className="mb-3 text-sm text-[#8b95b0]">
              Tell the DJ why you&apos;re cancelling.
              {booking.status === "awaiting_payment"
                ? ""
                : " Payments are not refunded automatically; contact support for refunds."}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              disabled={cancelling}
              placeholder="Reason"
              className="w-full resize-y rounded-xl border border-[#1e2536] bg-[#0d1117] p-3 text-[15px] text-[#e7ecff] outline-none placeholder:text-[#8b95b0] focus:border-[#6366f1]"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#8b95b0] hover:text-white"
              >
                Keep booking
              </button>
              <button
                type="button"
                disabled={cancelling || !cancelReason.trim()}
                onClick={handleCancel}
                className="rounded-xl bg-[#dc2626] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#b91c1c] disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
