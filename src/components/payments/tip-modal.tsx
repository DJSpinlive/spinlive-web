"use client";

import { useState } from "react";

import { useCreateTipMutation } from "@/store/api";
import type { CreateTipResponse } from "@/types/payments.types";
import { getErrorMessage } from "@/utilities/helpers";

import {
  formatMinorAmount,
  generateIdempotencyKey,
  isStripeConfigured,
  STRIPE_NOT_CONFIGURED_MESSAGE,
} from "./stripe";
import { StripeCheckoutModal } from "./stripe-checkout-modal";

const TIP_CURRENCY = "usd";
const PRESETS_MINOR = [200, 500, 1000, 2000];
const MAX_TIP_MINOR = 100_000;

interface TipModalProps {
  streamId: string;
  djName?: string | null;
  onClose: () => void;
  /** Called with a confirmation message once the tip has gone through. */
  onSent: (_message: string) => void;
}

export function TipModal({ streamId, djName, onClose, onSent }: TipModalProps) {
  const [amountMinor, setAmountMinor] = useState(PRESETS_MINOR[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingTip, setPendingTip] = useState<CreateTipResponse | null>(null);
  const [createTip, { isLoading }] = useCreateTipMutation();

  const selectedMinor = customAmount
    ? Math.round(Number(customAmount) * 100)
    : amountMinor;

  const sentMessage = (tip: CreateTipResponse) => {
    const label = formatMinorAmount(
      tip.amountMinor ?? selectedMinor,
      tip.currency || TIP_CURRENCY
    );
    return djName
      ? `You tipped ${djName} ${label}. Thank you!`
      : `You sent a ${label} tip. Thank you!`;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!isStripeConfigured) {
      setError(STRIPE_NOT_CONFIGURED_MESSAGE);
      return;
    }
    if (
      !Number.isInteger(selectedMinor) ||
      selectedMinor < 100 ||
      selectedMinor > MAX_TIP_MINOR
    ) {
      setError("Enter an amount between $1 and $1,000.");
      return;
    }
    try {
      const tip = await createTip({
        streamId,
        amountMinor: selectedMinor,
        currency: TIP_CURRENCY,
        idempotencyKey: generateIdempotencyKey(),
      }).unwrap();
      if (tip.status === "succeeded") {
        onSent(sentMessage(tip));
        return;
      }
      if (!tip.clientSecret) {
        setError("Payment could not be started. Please try again.");
        return;
      }
      setPendingTip(tip);
    } catch (e) {
      setError(getErrorMessage(e, { fallbackMessage: "Could not send tip." }));
    }
  };

  if (pendingTip) {
    return (
      <StripeCheckoutModal
        clientSecret={pendingTip.clientSecret}
        mode="payment"
        title={djName ? `Tip ${djName}` : "Send a tip"}
        description={`Amount: ${formatMinorAmount(pendingTip.amountMinor, pendingTip.currency)}`}
        submitLabel="Pay tip"
        onSuccess={() => onSent(sentMessage(pendingTip))}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-transparent"
        aria-label="Close dialog backdrop"
        onClick={isLoading ? undefined : onClose}
      />
      <div className="relative z-[1] w-full max-w-md rounded-2xl border border-[#1e2536] bg-[#11193e] p-5 shadow-xl">
        <h2 id="tip-modal-title" className="mb-1 text-lg font-bold text-white">
          {djName ? `Tip ${djName}` : "Send a tip"}
        </h2>
        <p className="mb-4 text-sm text-[#8b95b0]">
          Show some love for the set. Tips go straight to the DJ.
        </p>

        <div className="mb-4 grid grid-cols-4 gap-2">
          {PRESETS_MINOR.map((minor) => {
            const active = !customAmount && amountMinor === minor;
            return (
              <button
                key={minor}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setCustomAmount("");
                  setAmountMinor(minor);
                }}
                aria-pressed={active}
                className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                  active
                    ? "border-[#8b5cf6] bg-[#8b5cf6] text-white"
                    : "border-[#1e2536] bg-[#0d1117] text-[#e7ecff] hover:border-[#8b5cf6]"
                }`}
              >
                {formatMinorAmount(minor, TIP_CURRENCY)}
              </button>
            );
          })}
        </div>

        <label htmlFor="tip-custom-amount" className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#8b95b0]">
            Or enter an amount (USD)
          </span>
          <input
            id="tip-custom-amount"
            type="number"
            inputMode="decimal"
            min={1}
            max={MAX_TIP_MINOR / 100}
            step="0.01"
            placeholder="25.00"
            value={customAmount}
            disabled={isLoading}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#1e2536] bg-[#0d1117] px-3 text-[15px] text-[#e7ecff] outline-none placeholder:text-[#5f6983] focus:border-[#6366f1]"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-[#f87171]/50 bg-[#3c1f2a]/60 px-3 py-2 text-sm text-[#fecaca]"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[15px] font-semibold text-[#8b95b0] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="rounded-xl bg-[#8b5cf6] px-5 py-2 text-[15px] font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
          >
            {isLoading
              ? "Starting…"
              : `Tip ${Number.isFinite(selectedMinor) && selectedMinor > 0 ? formatMinorAmount(selectedMinor, TIP_CURRENCY) : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
