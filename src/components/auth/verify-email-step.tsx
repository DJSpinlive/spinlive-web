"use client";

import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { FormButton } from "@/components/ui/form-button";
import { cn } from "@/lib/utils";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "@/store/api";
import { VerifyEmailResponse } from "@/types/auth.types";
import { getErrorMessage } from "@/utilities/helpers";

const CODE_LENGTH = 6;
const DIGIT_SLOTS = Array.from({ length: CODE_LENGTH }, (_, i) => `digit-${i}`);
const emptyDigits = (): string[] =>
  Array.from({ length: CODE_LENGTH }, () => "");
const RESEND_COOLDOWN_SECONDS = 60;

interface VerifyEmailStepProps {
  email: string;
  /** Called after the code is accepted; the parent signs the user in. */
  onVerified: (_response: VerifyEmailResponse) => Promise<void> | void;
  onBack: () => void;
  /** Start the resend cooldown (true right after sign-up sent a code). */
  codeJustSent?: boolean;
}

export function VerifyEmailStep({
  email,
  onVerified,
  onBack,
  codeJustSent = true,
}: VerifyEmailStepProps) {
  const [digits, setDigits] = useState<string[]>(emptyDigits);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(
    codeJustSent ? RESEND_COOLDOWN_SECONDS : 0
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    const timer =
      cooldown > 0
        ? setTimeout(() => setCooldown((c) => c - 1), 1000)
        : undefined;
    return () => clearTimeout(timer);
  }, [cooldown]);

  const code = digits.join("");
  const isBusy = isVerifying || isFinishing;

  const submit = async (value: string) => {
    if (value.length !== CODE_LENGTH || isBusy) return;
    setError(null);
    setNotice(null);
    try {
      const response = await verifyEmail({ email, code: value }).unwrap();
      setIsFinishing(true);
      await onVerified(response ?? {});
    } catch (err: unknown) {
      setIsFinishing(false);
      setError(
        getErrorMessage(err, {
          fallbackMessage: "Unable to verify code. Please try again.",
        })
      );
      setDigits(emptyDigits());
      inputsRef.current[0]?.focus();
    }
  };

  const fillFrom = (index: number, raw: string) => {
    const chars = raw.replace(/\D/g, "").slice(0, CODE_LENGTH - index);
    if (!chars) return;
    const next = [...digits];
    chars.split("").forEach((char, offset) => {
      next[index + offset] = char;
    });
    setDigits(next);
    const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
    const joined = next.join("");
    if (joined.length === CODE_LENGTH) submit(joined).catch(() => null);
  };

  const handleChange = (index: number, value: string) => {
    if (value === "") {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    fillFrom(index, value);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fillFrom(index, e.clipboardData.getData("text"));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(code).catch(() => null);
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    try {
      await resendVerification({ email }).unwrap();
      setNotice("A new code is on its way. Check your inbox.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(emptyDigits());
      inputsRef.current[0]?.focus();
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, {
          fallbackMessage: "Unable to resend code. Please try again.",
        })
      );
    }
  };

  return (
    <div>
      <h2 className="mt-6 text-3xl font-semibold leading-tight text-white md:mt-0">
        Verify your email
      </h2>
      <p className="mt-2 max-w-sm text-base leading-6 text-[#9da8bf]">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-white">{email}</span>. Enter it below
        to activate your account.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[#f87171]/50 bg-[#3c1f2a]/60 px-3 py-2 text-sm text-[#fecaca]"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
          >
            {notice}
          </p>
        )}

        <div className="flex justify-between gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              key={DIGIT_SLOTS[index]}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={CODE_LENGTH}
              aria-label={`Digit ${index + 1}`}
              value={digit}
              disabled={isBusy}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              onFocus={(e) => e.target.select()}
              className={cn(
                "h-12 w-full min-w-0 rounded-xl border bg-[#04142a] text-center text-xl font-semibold text-white outline-none transition focus:border-[#7d66ff] sm:h-14",
                error ? "border-[#f87171]" : "border-[#ffffff30]"
              )}
            />
          ))}
        </div>

        <FormButton
          type="submit"
          disabled={isBusy || code.length !== CODE_LENGTH}
          className="bg-gradient-to-r from-[#8a63ff] to-[#6f56f3] text-base hover:from-[#9b7bff] hover:to-[#7b66ff]"
        >
          {isBusy ? "Verifying..." : "Verify Email"}
        </FormButton>
      </form>

      <p className="mt-7 text-center text-sm text-[#8b95ad]">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending || isBusy}
          className="text-sm font-medium text-[#7d66ff] transition hover:text-[#9a86ff] disabled:cursor-not-allowed disabled:text-[#5f6983]"
        >
          {isResending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </button>
      </p>
      <p className="mt-3 text-center text-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={isBusy}
          className="text-[#8b95ad] transition hover:text-white"
        >
          Use a different email
        </button>
      </p>
    </div>
  );
}
