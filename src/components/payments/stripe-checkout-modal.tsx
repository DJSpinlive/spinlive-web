"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { FormEvent, useMemo, useState } from "react";

import { getStripe } from "./stripe";

interface StripeCheckoutModalProps {
  /** PaymentIntent secret ("payment") or SetupIntent secret ("setup"). */
  clientSecret: string;
  mode: "payment" | "setup";
  title: string;
  description?: string;
  submitLabel: string;
  /** Lets the Payment Element list and reuse the customer's saved cards. */
  customerSessionClientSecret?: string;
  onSuccess: () => void;
  onClose: () => void;
}

const APPEARANCE: StripeElementsOptions["appearance"] = {
  theme: "night",
  variables: {
    colorPrimary: "#8b5cf6",
    colorBackground: "#0d1117",
    borderRadius: "12px",
  },
};

function CheckoutForm({
  mode,
  submitLabel,
  onSuccess,
  onClose,
}: Pick<
  StripeCheckoutModalProps,
  "mode" | "submitLabel" | "onSuccess" | "onClose"
>) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;
    setSubmitting(true);
    setError(null);
    /** 3-D Secure and wallets may redirect; they come back to this page. */
    const confirmParams = { return_url: window.location.href };
    const result =
      mode === "payment"
        ? await stripe.confirmPayment({
            elements,
            confirmParams,
            redirect: "if_required",
          })
        : await stripe.confirmSetup({
            elements,
            confirmParams,
            redirect: "if_required",
          });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message ?? "Payment failed. Please try again.");
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#f87171]/50 bg-[#3c1f2a]/60 px-3 py-2 text-sm text-[#fecaca]"
        >
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-[15px] font-semibold text-[#8b95b0] hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="rounded-xl bg-[#8b5cf6] px-5 py-2 text-[15px] font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
        >
          {submitting ? "Processing…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Stripe Payment Element in a dialog, for confirming a PaymentIntent or SetupIntent. */
export function StripeCheckoutModal({
  clientSecret,
  mode,
  title,
  description,
  submitLabel,
  customerSessionClientSecret,
  onSuccess,
  onClose,
}: StripeCheckoutModalProps) {
  const stripePromise = useMemo(() => getStripe(), []);
  const options = useMemo<StripeElementsOptions>(
    () => ({
      clientSecret,
      appearance: APPEARANCE,
      ...(customerSessionClientSecret ? { customerSessionClientSecret } : {}),
    }),
    [clientSecret, customerSessionClientSecret]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stripe-checkout-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#1e2536] bg-[#11193e] p-5 shadow-xl">
        <h2
          id="stripe-checkout-title"
          className="mb-1 text-lg font-bold text-white"
        >
          {title}
        </h2>
        {description ? (
          <p className="mb-4 text-sm text-[#8b95b0]">{description}</p>
        ) : null}
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            mode={mode}
            submitLabel={submitLabel}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      </div>
    </div>
  );
}
