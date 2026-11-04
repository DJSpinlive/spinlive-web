"use client";

import Link from "next/link";
import { useState } from "react";

import {
  formatMinorAmount,
  isStripeConfigured,
  STRIPE_NOT_CONFIGURED_MESSAGE,
} from "@/components/payments/stripe";
import { StripeCheckoutModal } from "@/components/payments/stripe-checkout-modal";
import {
  useCreateSetupSessionMutation,
  useCreateSubscriptionPortalMutation,
  useGetCurrentSubscriptionQuery,
  useGetTransactionsQuery,
} from "@/store/api";
import type {
  PaymentStatus,
  SetupSessionResponse,
  Transaction,
} from "@/types/payments.types";
import { getErrorMessage } from "@/utilities/helpers";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  succeeded: "text-emerald-400",
  processing: "text-amber-400",
  requires_payment_method: "text-amber-400",
  failed: "text-red-400",
  canceled: "text-[#6b7280]",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  succeeded: "Paid",
  processing: "Processing",
  requires_payment_method: "Incomplete",
  failed: "Failed",
  canceled: "Canceled",
};

function transactionTitle(t: Transaction): string {
  if (t.type === "tip") return "Tip";
  if (t.type === "refund") return "Refund";
  return "Booking payment";
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export default function PaymentSettingsPage() {
  const { data: transactions = [], isLoading: txLoading } =
    useGetTransactionsQuery();
  const { data: subscription } = useGetCurrentSubscriptionQuery();
  const [createSetupSession, { isLoading: setupLoading }] =
    useCreateSetupSessionMutation();
  const [createPortal, { isLoading: portalLoading }] =
    useCreateSubscriptionPortalMutation();
  const [setupSession, setSetupSession] = useState<SetupSessionResponse | null>(
    null
  );
  const [banner, setBanner] = useState<string | null>(null);

  const openManageCards = async () => {
    setBanner(null);
    if (!isStripeConfigured) {
      setBanner(STRIPE_NOT_CONFIGURED_MESSAGE);
      return;
    }
    try {
      setSetupSession(await createSetupSession().unwrap());
    } catch (e) {
      setBanner(
        getErrorMessage(e, { fallbackMessage: "Could not open card setup." })
      );
    }
  };

  const openBillingPortal = async () => {
    setBanner(null);
    try {
      const { url } = await createPortal().unwrap();
      window.location.assign(url);
    } catch (e) {
      setBanner(
        getErrorMessage(e, { fallbackMessage: "Could not open billing." })
      );
    }
  };

  return (
    <div className="pb-10">
      <Link
        href="/profile"
        className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
      >
        ← Back to profile
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-white">
        Payment configuration
      </h1>

      <div className="mx-auto mt-6 max-w-2xl space-y-5">
        {banner ? (
          <div
            role="status"
            className="rounded-xl border border-[#1e2536] bg-[#0d1117] px-4 py-3 text-sm text-[#e5e7eb]"
          >
            {banner}
          </div>
        ) : null}

        <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-5">
          <h2 className="text-lg font-bold text-white">Saved cards</h2>
          <p className="mt-1 text-sm text-[#8b95b0]">
            Add a card for faster booking payments and tips, or remove cards you
            no longer use. Cards are stored securely by Stripe.
          </p>
          <button
            type="button"
            disabled={setupLoading}
            onClick={openManageCards}
            className="mt-4 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
          >
            {setupLoading ? "Opening…" : "Manage cards"}
          </button>
        </section>

        {subscription?.subscriptionId ? (
          <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-5">
            <h2 className="text-lg font-bold text-white">Subscription</h2>
            <p className="mt-1 text-sm text-[#c7d0ff]">
              {subscription.plan ?? "Plan"} ·{" "}
              <span className="capitalize">
                {subscription.status?.replace(/_/g, " ")}
              </span>
            </p>
            {subscription.currentPeriodEnd ? (
              <p className="text-sm text-[#8b95b0]">
                {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            ) : null}
            <button
              type="button"
              disabled={portalLoading}
              onClick={openBillingPortal}
              className="mt-4 rounded-xl border border-[#8b5cf6] px-5 py-2.5 text-sm font-bold text-[#8b5cf6] transition hover:bg-[#8b5cf6]/10 disabled:opacity-50"
            >
              {portalLoading ? "Opening…" : "Manage billing"}
            </button>
          </section>
        ) : null}

        <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-5">
          <h2 className="mb-3 text-lg font-bold text-white">Payment history</h2>
          {txLoading ? (
            <p className="text-sm text-[#8b95b0]">Loading…</p>
          ) : null}
          {!txLoading && transactions.length === 0 ? (
            <p className="text-sm text-[#8b95b0]">
              Tips and booking payments will appear here.
            </p>
          ) : null}
          {transactions.length > 0 ? (
            <ul className="divide-y divide-[#1e2536]">
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {t.bookingId ? (
                        <Link
                          href={`/bookings/${t.bookingId}`}
                          className="hover:underline"
                        >
                          {transactionTitle(t)}
                        </Link>
                      ) : (
                        transactionTitle(t)
                      )}
                    </p>
                    <p className="text-xs text-[#8b95b0]">
                      {formatDate(t.completedAt ?? t.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {formatMinorAmount(t.amountMinor, t.currency)}
                    </p>
                    <p className={`text-xs ${STATUS_STYLES[t.status] ?? ""}`}>
                      {STATUS_LABELS[t.status] ?? t.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      {setupSession ? (
        <StripeCheckoutModal
          clientSecret={setupSession.setupIntentClientSecret}
          customerSessionClientSecret={setupSession.customerSessionClientSecret}
          mode="setup"
          title="Manage cards"
          description="Add a new card. Saved cards are listed above the form."
          submitLabel="Save card"
          onSuccess={() => {
            setSetupSession(null);
            setBanner("Card saved. It's ready for your next payment.");
          }}
          onClose={() => setSetupSession(null)}
        />
      ) : null}
    </div>
  );
}
