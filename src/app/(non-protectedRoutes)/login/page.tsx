"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { VerifyEmailStep } from "@/components/auth/verify-email-step";
import { FormButton } from "@/components/ui/form-button";
import { FormInput } from "@/components/ui/form-input";
import { Logo } from "@/components/ui/logo";
import {
  useLoginUserMutation,
  userApi,
  useResendVerificationMutation,
} from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { refreshTokenSuccess } from "@/store/slices/authSlice";
import { LoginUserResponse, VerifyEmailResponse } from "@/types/auth.types";
import { setAuthTokensToCookies } from "@/utilities/clientCookies";
import { getErrorMessage } from "@/utilities/helpers";

const loginSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .email("Enter a valid email address")
      .required("Email address is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })
  .required();

type LoginFormValues = yup.InferType<typeof loginSchema>;

/** Auth rejects logins for accounts that haven't entered their sign-up OTP yet. */
function isUnverifiedEmailError(error: unknown): boolean {
  const detail = (error as { data?: { detail?: unknown } } | null)?.data
    ?.detail;
  const code =
    detail && typeof detail === "object" && "code" in detail
      ? String((detail as { code: unknown }).code)
      : "";
  return (
    /verif/i.test(code) ||
    /not verified|verify your/i.test(getErrorMessage(error))
  );
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loginUser] = useLoginUserMutation();
  const [resendVerification] = useResendVerificationMutation();
  /** Set when login is blocked on email verification; shows the OTP step. */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  /** Kept in memory only, to finish signing in after the code is verified. */
  const passwordRef = useRef("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const completeSignIn = async (response: LoginUserResponse) => {
    setAuthTokensToCookies(response);
    dispatch(
      refreshTokenSuccess({
        token: response.access_token,
        refreshToken: response.refresh_token,
      })
    );
    /** Login's `user` comes from auth and lacks the profile flag, so read `/users/me`. */
    const profile = await dispatch(
      userApi.endpoints.getUser.initiate(undefined, { forceRefetch: true })
    )
      .unwrap()
      .catch(() => null);
    router.push(
      profile && profile.onboarding_completed === false
        ? "/onboarding"
        : "/home"
    );
  };

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setSubmitError(null);
    try {
      const response = await loginUser(values).unwrap();
      await completeSignIn(response);
    } catch (error: unknown) {
      if (isUnverifiedEmailError(error)) {
        passwordRef.current = values.password;
        await resendVerification({ email: values.email }).catch(() => null);
        setPendingEmail(values.email);
        return;
      }
      setSubmitError(
        getErrorMessage(error, {
          fallbackMessage: "Unable to log in. Please try again.",
        })
      );
    }
  };

  const handleVerified = async (verified: VerifyEmailResponse) => {
    const tokens =
      verified.access_token && verified.refresh_token && verified.user
        ? (verified as LoginUserResponse)
        : await loginUser({
            email: pendingEmail ?? "",
            password: passwordRef.current,
          }).unwrap();
    passwordRef.current = "";
    await completeSignIn(tokens);
  };

  return (
    <main className="min-h-screen bg-[#030a17] px-4 py-6 text-white sm:px-6 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#12213c] bg-[#050f1f] shadow-[0_30px_70px_rgba(0,0,0,0.5)] md:grid-cols-2">
          <section className="hidden h-full flex-col justify-between border-r border-[#12213c] bg-[radial-gradient(circle_at_top,#3f2f85_0%,#111d35_40%,#050f1f_75%)] p-10 md:flex">
            <div>
              <Logo />
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white">
                Welcome back to your interactive DJ world.
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#9aa5bc]">
                Sign in and continue enjoying live music moments tailored for
                your community.
              </p>
            </div>

            <div className="rounded-2xl border border-[#334060] bg-[#0a1428]/80 p-5">
              <p className="text-sm text-[#bac7de]">
                New here? Join SpinLive and start building your community.
              </p>
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="mt-4 rounded-xl bg-[#7d5ef5] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#8c70ff]"
              >
                Create account
              </button>
            </div>
          </section>

          <section className="w-full p-4 sm:p-8 md:p-10">
            <Logo className="md:hidden" />

            {pendingEmail ? (
              <VerifyEmailStep
                email={pendingEmail}
                onVerified={handleVerified}
                onBack={() => {
                  passwordRef.current = "";
                  setPendingEmail(null);
                }}
              />
            ) : (
              <>
                <h2 className="mt-6 text-3xl font-semibold leading-tight text-white md:mt-0">
                  Welcome Back
                </h2>
                <p className="mt-2 max-w-sm text-base leading-6 text-[#9da8bf]">
                  Log in to continue your interactive DJ experience.
                </p>

                <form
                  className="mt-8 space-y-5"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {submitError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-[#f87171]/50 bg-[#3c1f2a]/60 px-3 py-2 text-sm text-[#fecaca]"
                    >
                      {submitError}
                    </p>
                  )}

                  <FormInput
                    id="email"
                    label="Email Address"
                    aria-label="Email address"
                    type="email"
                    placeholder="alex@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <FormInput
                    id="password"
                    label="Password"
                    aria-label="Password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    rightAdornment={
                      <button
                        type="button"
                        onClick={() =>
                          setIsPasswordVisible((current) => !current)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#6e7893]"
                        aria-label={
                          isPasswordVisible ? "Hide password" : "Show password"
                        }
                      >
                        {isPasswordVisible ? "🙈" : "👁"}
                      </button>
                    }
                    {...register("password")}
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-medium text-[#7b63f8] transition hover:text-[#9d8dff]"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <FormButton
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#8a63ff] to-[#6f56f3] text-base hover:from-[#9b7bff] hover:to-[#7b66ff]"
                  >
                    {isSubmitting ? "Logging in..." : "Log In"}
                  </FormButton>
                </form>

                <div className="my-5 text-center text-base text-[#8b95ad]">
                  Or continue with
                </div>

                <div className="space-y-3">
                  {/* Social sign-in is disabled until the auth service exposes an OAuth exchange endpoint. */}
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="h-12 w-full cursor-not-allowed rounded-xl border border-[#142544] bg-[#051122] text-base text-[#dce4f5] opacity-50"
                  >
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="h-12 w-full cursor-not-allowed rounded-xl border border-[#142544] bg-[#051122] text-base text-[#dce4f5] opacity-50"
                  >
                    Continue with Apple
                  </button>
                </div>

                <p className="mt-7 text-center text-sm text-[#8b95ad]">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/signup")}
                    className="text-sm font-medium text-[#7d66ff] transition hover:text-[#9a86ff]"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
