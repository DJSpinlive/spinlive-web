"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import { RemoteAvatarImage } from "@/components/RemoteAvatarImage/RemoteAvatarImage";
import { FormButton } from "@/components/ui/form-button";
import { FormInput } from "@/components/ui/form-input";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  useGetGenrePreferencesQuery,
  useGetGenresQuery,
  useGetUserQuery,
  useUpdateGenrePreferencesMutation,
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
} from "@/store/api";
import { getErrorMessage } from "@/utilities/helpers";
import { markOnboardingComplete } from "@/utilities/onboarding-storage";

const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop";

const MIN_GENRES = 1;
const STEPS = ["Genres", "Profile", "Done"] as const;

type StepIndex = 0 | 1 | 2;

function StepDots({ current }: { current: StepIndex }) {
  return (
    <ol className="flex items-center gap-3" aria-label="Onboarding progress">
      {STEPS.map((label, index) => {
        const isDone = index < current;
        const isActive = index === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition",
                isDone && "border-[#8b5cf6] bg-[#8b5cf6] text-white",
                isActive && !isDone && "border-[#8b5cf6] text-[#c7bbff]",
                !isDone && !isActive && "border-[#1e2a46] text-[#5f6983]"
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                isActive ? "text-white" : "text-[#6e7893]"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydratedUserIdRef = useRef<string | null>(null);

  const { data: user } = useGetUserQuery();
  const { data: genres = [], isLoading: genresLoading } = useGetGenresQuery();
  const { data: existingPrefs } = useGetGenrePreferencesQuery();

  const [updateGenrePreferences, { isLoading: savingGenres }] =
    useUpdateGenrePreferencesMutation();
  const [updateUser, { isLoading: savingProfile }] = useUpdateUserMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] =
    useUploadUserAvatarMutation();

  const [step, setStep] = useState<StepIndex>(0);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      existingPrefs &&
      existingPrefs.length > 0 &&
      selectedSlugs.length === 0
    ) {
      setSelectedSlugs(existingPrefs.map((genre) => genre.slug));
    }
    // Seeds once from the server; later edits stay local until saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPrefs]);

  useEffect(() => {
    if (!user || hydratedUserIdRef.current === user.id) return;
    hydratedUserIdRef.current = user.id;
    setBio(user.bio?.trim() ?? "");
    setLocation(user.location?.trim() ?? "");
  }, [user]);

  const toggleGenre = useCallback((slug: string) => {
    setSelectedSlugs((current) =>
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug]
    );
  }, []);

  const finish = useCallback(() => {
    markOnboardingComplete(user?.id);
    router.replace("/home");
  }, [router, user?.id]);

  const skip = useCallback(() => {
    markOnboardingComplete(user?.id);
    router.replace("/home");
  }, [router, user?.id]);

  const saveGenres = useCallback(async () => {
    if (selectedSlugs.length < MIN_GENRES) {
      setError("Pick at least one genre so we can match you with DJs.");
      return;
    }
    setError(null);
    try {
      await updateGenrePreferences({ genre_slugs: selectedSlugs }).unwrap();
      setStep(1);
    } catch (e) {
      setError(
        getErrorMessage(e, { fallbackMessage: "Could not save your genres." })
      );
    }
  }, [selectedSlugs, updateGenrePreferences]);

  const saveProfile = useCallback(async () => {
    setError(null);
    try {
      const bioTrimmed = bio.trim();
      const locationTrimmed = location.trim();
      await updateUser({
        bio: bioTrimmed,
        location: locationTrimmed.length > 0 ? locationTrimmed : undefined,
      }).unwrap();
      setStep(2);
    } catch (e) {
      setError(
        getErrorMessage(e, { fallbackMessage: "Could not save your profile." })
      );
    }
  }, [bio, location, updateUser]);

  const handleAvatarChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }

      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        await uploadAvatar(formData).unwrap();
      } catch (e) {
        setError(
          getErrorMessage(e, { fallbackMessage: "Could not upload photo." })
        );
      }
    },
    [uploadAvatar]
  );

  const busy = savingGenres || savingProfile || uploadingAvatar;
  const firstName = user?.display_name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 md:py-12">
      <div className="flex items-center justify-between gap-4">
        <Logo />
        {step < 2 ? (
          <button
            type="button"
            onClick={skip}
            className="text-sm font-medium text-[#8b95ad] transition hover:text-white"
          >
            Skip for now
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        <StepDots current={step} />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-[#f87171]/50 bg-[#3c1f2a]/60 px-4 py-3 text-sm text-[#fecaca]"
        >
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <section className="mt-8">
          <h1 className="text-3xl font-semibold leading-tight text-white">
            Welcome, {firstName}. What do you listen to?
          </h1>
          <p className="mt-2 text-base leading-6 text-[#9da8bf]">
            Pick the genres you love. We use them to surface DJs and live
            streams that match your taste.
          </p>

          {genresLoading ? (
            <div className="mt-8 flex items-center gap-3 text-sm text-[#9ca3af]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
              Loading genres…
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {genres.map((genre) => {
                const isSelected = selectedSlugs.includes(genre.slug);
                return (
                  <button
                    key={genre.slug}
                    type="button"
                    onClick={() => toggleGenre(genre.slug)}
                    aria-pressed={isSelected}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      isSelected
                        ? "border-[#8b5cf6] bg-[#8b5cf6]/20 text-white"
                        : "border-[#1e2a46] bg-[#050f1f] text-[#bac7de] hover:border-[#2e4d88]"
                    )}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-sm text-[#6e7893]">
            {selectedSlugs.length} selected
          </p>

          <FormButton
            type="button"
            disabled={busy}
            onClick={saveGenres}
            className="mt-8 bg-gradient-to-r from-[#8a63ff] to-[#6f56f3] text-base hover:from-[#9b7bff] hover:to-[#7b66ff] sm:w-auto sm:px-10"
          >
            {savingGenres ? "Saving…" : "Continue"}
          </FormButton>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="mt-8">
          <h1 className="text-3xl font-semibold leading-tight text-white">
            Set up your profile
          </h1>
          <p className="mt-2 text-base leading-6 text-[#9da8bf]">
            A photo and a short bio help DJs recognise you in chat and when you
            book a set.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden
            onChange={handleAvatarChange}
          />

          <div className="mt-8 flex items-center gap-5 rounded-2xl border border-[#12213c] bg-[#050f1f] p-5">
            <RemoteAvatarImage
              uri={user?.avatar_url ?? ""}
              fallbackUri={AVATAR_FALLBACK}
              alt="Your profile photo"
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-full object-cover ring-2 ring-[#1e2536]"
            />
            <div>
              <p className="text-sm font-medium text-white">Profile photo</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 rounded-xl bg-[#1a2234] px-4 py-2 text-sm text-white transition hover:bg-[#242f44] disabled:opacity-60"
              >
                {uploadingAvatar ? "Uploading…" : "Upload photo"}
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="mb-2 block text-sm font-medium text-[#e7ebf5]">
                Bio
              </p>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Tell DJs a little about the nights you love…"
                className="w-full resize-none rounded-xl border border-transparent bg-[#04142a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#5f6983] focus:border-[#4e5e92]"
              />
            </div>

            <FormInput
              id="location"
              label="City"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City or region"
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <FormButton
              type="button"
              disabled={busy}
              onClick={() => setStep(0)}
              className="border border-[#1e2a46] bg-transparent hover:border-[#2e4d88] sm:w-auto sm:px-8"
            >
              Back
            </FormButton>
            <FormButton
              type="button"
              disabled={busy}
              onClick={saveProfile}
              className="bg-gradient-to-r from-[#8a63ff] to-[#6f56f3] text-base hover:from-[#9b7bff] hover:to-[#7b66ff] sm:w-auto sm:px-10"
            >
              {savingProfile ? "Saving…" : "Continue"}
            </FormButton>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6]/20 text-[#c7bbff]">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-tight text-white">
            You are all set
          </h1>
          <p className="mt-2 max-w-lg text-base leading-6 text-[#9da8bf]">
            Your feed is tuned to {selectedSlugs.length} genre
            {selectedSlugs.length === 1 ? "" : "s"}. You can change any of this
            later from Settings.
          </p>

          <FormButton
            type="button"
            onClick={finish}
            className="mt-8 bg-gradient-to-r from-[#8a63ff] to-[#6f56f3] text-base hover:from-[#9b7bff] hover:to-[#7b66ff] sm:w-auto sm:px-10"
          >
            Start exploring
          </FormButton>
        </section>
      ) : null}
    </main>
  );
}
