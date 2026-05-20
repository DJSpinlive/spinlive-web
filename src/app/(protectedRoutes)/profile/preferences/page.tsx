"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { FormButton } from "@/components/ui/form-button";
import { ToggleSettingRow } from "@/components/ui/toggle";
import {
  FILTER_TAB_PRIMARY,
  DISCOVER_GENRE_FILTERS,
} from "@/constants/genre-discovery";
import {
  useGetGenrePreferencesQuery,
  useUpdateGenrePreferencesMutation,
} from "@/store/api";
import type { BudgetTierId } from "@/utilities/discovery-preferences-storage";
import {
  loadDiscoveryPrefs,
  saveDiscoveryPrefs,
} from "@/utilities/discovery-preferences-storage";
import { getErrorMessage } from "@/utilities/helpers";

const BUDGET_TIERS: {
  id: BudgetTierId;
  label: string;
  dotClass: string;
}[] = [
  { id: "tier1", label: "$ ($0-$50/hr)", dotClass: "bg-[#60A5FA]" },
  { id: "tier2", label: "$$ ($100-$300/hr)", dotClass: "bg-[#F97316]" },
  { id: "tier3", label: "$$$ ($300-$600/hr)", dotClass: "bg-[#A855F7]" },
];

export default function PreferencesPage() {
  const router = useRouter();

  const {
    data: genrePrefs,
    isLoading: genrePrefsLoading,
    isError: genrePrefsError,
    refetch: refetchGenrePrefs,
  } = useGetGenrePreferencesQuery();

  const [updateGenrePreferences, { isLoading: genrePrefsSaving }] =
    useUpdateGenrePreferencesMutation();

  const [genresOpen, setGenresOpen] = useState(true);
  const [discoveryOpen, setDiscoveryOpen] = useState(true);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const [selectedGenreSlugs, setSelectedGenreSlugs] = useState<string[]>([]);
  const [localDjsOnly, setLocalDjsOnly] = useState(false);
  const [showVirtualStreams, setShowVirtualStreams] = useState(true);
  const [budgetTierId, setBudgetTierId] = useState<BudgetTierId>("tier2");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const lp = loadDiscoveryPrefs();
    setLocalDjsOnly(lp.localDjsOnly);
    setShowVirtualStreams(lp.showVirtualStreams);
    setBudgetTierId(lp.budgetTierId);
  }, []);

  useEffect(() => {
    if (genrePrefs !== undefined) {
      setSelectedGenreSlugs(genrePrefs.map((g) => g.slug));
    }
  }, [genrePrefs]);

  const selectedBudget = useMemo(
    () => BUDGET_TIERS.find((t) => t.id === budgetTierId) ?? BUDGET_TIERS[1],
    [budgetTierId]
  );

  const toggleGenreSlug = useCallback((slug: string) => {
    setSelectedGenreSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const save = useCallback(async () => {
    setSaveError(null);
    try {
      await updateGenrePreferences({
        genre_slugs: selectedGenreSlugs,
      }).unwrap();

      saveDiscoveryPrefs({
        localDjsOnly,
        showVirtualStreams,
        budgetTierId,
      });
      setShowSuccessModal(true);
    } catch (e: unknown) {
      setSaveError(
        getErrorMessage(e, { fallbackMessage: "Could not save preferences." })
      );
    }
  }, [
    budgetTierId,
    localDjsOnly,
    selectedGenreSlugs,
    showVirtualStreams,
    updateGenrePreferences,
  ]);

  const dismissSuccessAndLeave = useCallback(() => {
    setShowSuccessModal(false);
    router.push("/profile");
  }, [router]);

  const saveDisabled =
    genrePrefsSaving || (genrePrefsLoading && genrePrefs === undefined);

  return (
    <div className="mx-auto w-full max-w-lg pb-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1e2536] bg-[#0d1117] transition hover:border-[#2d3548]"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Preferences</h1>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-[#8e97c4]">
        Personalize your feed. We use these settings to recommend the best live
        streams and DJs for your events.
      </p>

      <div className="space-y-3.5">
        <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            onClick={() => setGenresOpen((o) => !o)}
          >
            <span className="text-[17px] font-bold text-white">
              Favorite genres
            </span>
            {genresOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-[#9ba1a6]" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-[#9ba1a6]" />
            )}
          </button>

          {genresOpen ? (
            <div className="mt-2.5">
              <p className="mb-3.5 text-[13px] leading-snug text-[#8e97c4]">
                Select the music styles you love.
              </p>
              {genrePrefsLoading && genrePrefs === undefined ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
                </div>
              ) : genrePrefsError ? (
                <div className="py-2">
                  <p className="text-sm text-[#8e97c4]">
                    Could not load your genre preferences.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchGenrePrefs()}
                    className="mt-3 rounded-xl border border-[#8b5cf6]/50 bg-[#8b5cf6]/15 px-3.5 py-2 text-sm font-bold text-[#c4b5fd]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {DISCOVER_GENRE_FILTERS.map(({ label, apiGenre }) => {
                    const selected = selectedGenreSlugs.includes(apiGenre);
                    return (
                      <button
                        key={apiGenre}
                        type="button"
                        onClick={() => toggleGenreSlug(apiGenre)}
                        className={`rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
                          selected
                            ? "border-transparent bg-[#8b5cf6] text-white"
                            : "border-[#1e2536] bg-[#111420] text-[#e7ecff] hover:border-[#2d3548]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            onClick={() => setDiscoveryOpen((o) => !o)}
          >
            <span className="text-[17px] font-bold text-white">
              Discovery settings
            </span>
            {discoveryOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-[#9ba1a6]" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-[#9ba1a6]" />
            )}
          </button>

          {discoveryOpen ? (
            <div className="mt-2.5">
              <p className="mb-4 text-[13px] leading-snug text-[#8e97c4]">
                Control which DJs and events show up first.
              </p>

              <ToggleSettingRow
                tone="muted"
                title="Local DJs only"
                subtitle="Prioritize nearby talent for in-person bookings and live meetups."
                checked={localDjsOnly}
                onCheckedChange={setLocalDjsOnly}
              />

              <div className="mt-4 border-t border-[#1e2536] pt-4">
                <ToggleSettingRow
                  tone="muted"

                  title="Show virtual streams"
                  subtitle="Include online-only sets and hybrid events in discovery."

                  checked={showVirtualStreams}
                  onCheckedChange={setShowVirtualStreams}
                />
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-[#6b7280]">
                Discovery switches are saved on this device until the backend
                exposes them — genre choices sync to your account.
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            onClick={() => setBudgetOpen((o) => !o)}
          >
            <span className="text-[17px] font-bold text-white">
              Booking budget
            </span>
            {budgetOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-[#9ba1a6]" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-[#9ba1a6]" />
            )}
          </button>

          {!budgetOpen ? (
            <div className="mt-3 flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${selectedBudget.dotClass}`}
              />
              <span className="text-[15px] font-semibold text-[#e7ecff]">
                {selectedBudget.label}
              </span>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {BUDGET_TIERS.map((tier) => {
                const selected = tier.id === budgetTierId;
                return (
                  <li key={tier.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setBudgetTierId(tier.id);
                        setBudgetOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-[#8b5cf6] bg-[#8b5cf6]/12"
                          : "border-transparent bg-transparent hover:bg-[#070b12]"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${tier.dotClass}`}
                      />
                      <span
                        className={`flex-1 text-[15px] font-semibold ${
                          selected ? "text-white" : "text-[#e7ecff]"
                        }`}
                      >
                        {tier.label}
                      </span>
                      {selected ? (
                        <CheckCircle2 className="h-[22px] w-[22px] shrink-0 text-[#8b5cf6]" />
                      ) : (
                        <span className="w-[22px] shrink-0" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8 border-t border-[#1e2536] pt-6">
        {saveError ? (
          <p className="mb-2 rounded-lg border border-[#f87171]/40 bg-[#3c1f2a]/60 px-3 py-2 text-xs text-[#fecaca]">
            {saveError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={saveDisabled}
          style={{ backgroundColor: FILTER_TAB_PRIMARY }}
          onClick={() => save()}
          className="flex h-[52px] w-full items-center justify-center rounded-2xl text-base font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {genrePrefsSaving ? (
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Save preferences"
          )}
        </button>
      </div>

      {showSuccessModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prefs-success-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-transparent"
            aria-label="Close preferences success"
            onClick={dismissSuccessAndLeave}
          />
          <div className="relative z-[1] w-full max-w-md rounded-2xl border border-[#1e2536] bg-[#11193e] p-6 shadow-xl">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: FILTER_TAB_PRIMARY }}
            >
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2
              id="prefs-success-title"
              className="text-center text-xl font-extrabold text-white"
            >
              Preferences saved
            </h2>
            <p className="mt-2 text-center text-[15px] leading-relaxed text-[#c7d0ff]">
              Your feed and discovery settings are updated.
            </p>
            <div className="mt-5">
              <FormButton
                type="button"
                onClick={dismissSuccessAndLeave}
                className="bg-[#8b5cf6] hover:bg-[#7c4ddb]"
              >
                Done
              </FormButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
