"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import {
  RatingStarOutlineIcon,
  RatingStarSolidIcon,
  VerifiedCircleIcon,
} from "@/components/assets";
import {
  useDjDetailQuery,
  useFollowDjMutation,
  useGetDjReviewsQuery,
  useReviewDjMutation,
  useUnFollowDjMutation,
} from "@/store/api/djApi";
import {
  bookingCountFromUser,
  djAvatarFallback,
  followerCountFromUser,
  formatCompact,
  formatReviewDate,
  formatUsdHourly,
  isFollowingFromUser,
  reviewAuthorLabel,
  reviewBody,
  reviewStarCount,
  summarizeAvailability,
  toHttpsAvatarUrl,
} from "@/utilities/dj-profile-helpers";
import { getErrorMessage } from "@/utilities/helpers";

const ACCENT = "#8b5cf6";

export default function DjProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const djId = typeof params?.id === "string" ? params.id.trim() : "";
  const validId = djId.length > 0;

  const {
    data: dj,
    isLoading: djLoading,
    isError: djError,
    refetch: refetchDj,
  } = useDjDetailQuery(djId, { skip: !validId });

  const {
    data: reviews = [],
    isFetching: reviewsFetching,
    refetch: refetchReviews,
  } = useGetDjReviewsQuery({ djId }, { skip: !validId });

  const [followDj, { isLoading: followBusy }] = useFollowDjMutation();
  const [unfollowDj, { isLoading: unfollowBusy }] = useUnFollowDjMutation();
  const [reviewDj, { isLoading: reviewSubmitting }] = useReviewDjMutation();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDraft, setReviewDraft] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [banner, setBanner] = useState<string | null>(null);

  const closeReviewModal = useCallback(() => {
    setReviewModalOpen(false);
    setReviewDraft("");
    setReviewRating(5);
  }, []);

  const openReviewModal = useCallback(() => {
    setReviewDraft("");
    setReviewRating(5);
    setReviewModalOpen(true);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refetchDj(), refetchReviews()]);
  }, [refetchDj, refetchReviews]);

  const displayName = useMemo(
    () => dj?.display_name?.trim() || "DJ",
    [dj?.display_name]
  );

  const handleLine = useMemo(() => {
    if (!dj) return "";
    const base = displayName.replace(/\s+/g, "").toLowerCase() || "dj";
    return `@${base}`;
  }, [dj, displayName]);

  const avatarFallback = useMemo(
    () => djAvatarFallback(djId || "spinlive"),
    [djId]
  );

  const avatarUri = useMemo(() => {
    if (!dj?.avatar_url) return avatarFallback;
    return toHttpsAvatarUrl(dj.avatar_url) || avatarFallback;
  }, [dj, avatarFallback]);

  const genres = useMemo(
    () => (dj?.genres ?? []).map((g) => g.trim()).filter(Boolean),
    [dj?.genres]
  );

  const hourlyLabel = useMemo(() => {
    const rate = dj?.hourly_rate;
    if (
      rate === null ||
      rate === undefined ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return "Rate on request";
    }
    return `${formatUsdHourly(rate)}/hr`;
  }, [dj?.hourly_rate]);

  const isFollowing = isFollowingFromUser(dj);
  const followBusyAny = followBusy || unfollowBusy;

  const handleFollow = useCallback(async () => {
    if (!validId || !dj) return;
    try {
      if (isFollowingFromUser(dj)) {
        await unfollowDj(djId).unwrap();
      } else {
        await followDj(djId).unwrap();
      }
      setBanner(null);
    } catch (e) {
      setBanner(
        getErrorMessage(e, { fallbackMessage: "Could not update follow." })
      );
    }
  }, [dj, djId, validId, followDj, unfollowDj]);

  const handleBook = useCallback(() => {
    if (!validId) return;
    router.push(`/djs/${djId}/book`);
  }, [router, djId, validId]);

  const handleTip = useCallback(() => {
    window.alert("Tipping feature coming soon!");
  }, []);

  const handleWatchLive = useCallback(() => {
    router.push("/live");
  }, [router]);

  const submitReview = useCallback(async () => {
    const text = reviewDraft.trim();
    if (!validId) return;
    if (reviewRating < 1 || reviewRating > 5) {
      setBanner("Choose a rating from 1 to 5 stars.");
      return;
    }
    if (text.length < 3) {
      setBanner("Please write at least a few words.");
      return;
    }
    try {
      await reviewDj({
        djId,
        rating: reviewRating,
        comment: text,
      }).unwrap();
      closeReviewModal();
      setBanner("Your review was posted.");
    } catch (e) {
      window.alert(`Could not post review: ${getErrorMessage(e)}`);
    }
  }, [djId, validId, reviewDj, reviewDraft, reviewRating, closeReviewModal]);

  const headerActions = (
    <div className="mb-6 flex items-center gap-4 border-b border-[#1e2536] pb-4">
      <Link
        href="/djs"
        className="flex flex-1 items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
      >
        ← Back to DJs
      </Link>
      <h1 className="pointer-events-none text-center text-base font-bold text-white sm:flex-initial">
        DJ Profile
      </h1>
      <div className="flex flex-1 justify-end gap-2">
        <button
          type="button"
          onClick={() => refreshAll()}
          className="rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[#8b95b0] transition hover:bg-[#1e2536] hover:text-white"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() =>
            window.alert("Options — report or share profile (coming soon).")
          }
          className="rounded-lg px-2 py-2 text-[#8b95b0] transition hover:bg-[#1e2536] hover:text-white"
          aria-label="More options"
        >
          ⋯
        </button>
      </div>
    </div>
  );

  if (!validId) {
    return (
      <div className="pb-10">
        {headerActions}
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-bold text-white">Invalid link</p>
          <p className="text-sm text-[#8b95b0]">
            This DJ profile URL is missing an id.
          </p>
        </div>
      </div>
    );
  }

  if (djLoading && !dj) {
    return (
      <div className="pb-10">
        {headerActions}
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
          <p className="text-sm text-[#8b95b0]">Loading DJ…</p>
        </div>
      </div>
    );
  }

  if (djError || !dj) {
    return (
      <div className="pb-10">
        {headerActions}
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-bold text-white">Could not load DJ</p>
          <p className="max-w-md text-sm text-[#8b95b0]">
            Check your connection or try again later.
          </p>
          <button
            type="button"
            onClick={() => refetchDj()}
            className="rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c3aed]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ratingAvg = dj.rating_avg ?? 0;
  const ratingCount = dj.rating_count ?? 0;
  const followers = followerCountFromUser(dj);
  const bookingsStat = bookingCountFromUser(dj);
  const availabilityLine = summarizeAvailability(dj);
  const bioText =
    dj.bio && dj.bio.trim().length > 0 ? dj.bio.trim() : "No bio yet.";
  const notDj = dj.role !== "dj";

  return (
    <div className="pb-10">
      {headerActions}

      {banner ? (
        <div
          className="-mt-2 mb-4 rounded-xl border border-[#1e2536] bg-[#0d1117] px-4 py-3 text-sm text-[#e5e7eb]"
          role="status"
        >
          {banner}
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="ml-3 text-[#8b95b0] underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl space-y-6">
        {notDj ? (
          <div className="rounded-xl border border-[#1e2536] bg-[#0d1117] p-4 text-sm text-[#8b95b0]">
            This account is not marked as a DJ on the server; showing public
            fields only.
          </div>
        ) : null}

        <section className="flex flex-col items-center pt-4 text-center">
          <button
            type="button"
            disabled={!dj.is_live}
            onClick={() => dj.is_live && handleWatchLive()}
            className={`relative outline-none ${dj.is_live ? "cursor-pointer" : ""}`}
            aria-label={dj.is_live ? "Watch live" : undefined}
          >
            <span
              className={`inline-flex rounded-full p-1 ${
                dj.is_live ? "ring-4 ring-[#dc2626]" : "ring-4 ring-[#1e2536]"
              }`}
            >
              <span className="overflow-hidden rounded-full bg-[#0d1117]">
                <Image
                  src={avatarUri || avatarFallback}
                  alt={displayName}
                  width={112}
                  height={112}
                  className="h-28 w-28 object-cover"
                  unoptimized
                />
              </span>
            </span>
            {dj.is_live ? (
              <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 rounded-lg border-2 border-[#070b12] bg-[#dc2626] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
                LIVE
              </span>
            ) : null}
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
            <h2 className="text-2xl font-extrabold text-white">
              {displayName}
            </h2>
            {dj.kyc_verified ? (
              <VerifiedCircleIcon className="ml-2 inline h-5 w-5 shrink-0 text-[#22c55e]" />
            ) : null}
          </div>
          <p className="mt-1 text-[15px] font-medium text-[#8b95b0]">
            {handleLine}
          </p>

          {dj.location && dj.location.trim().length > 0 ? (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-[#8b95b0]">
              <span aria-hidden className="text-base">
                📍
              </span>
              <span>{dj.location.trim()}</span>
            </p>
          ) : null}
        </section>

        <section className="mx-auto grid max-w-lg grid-cols-4 gap-0 rounded-2xl border border-[#1e2536] bg-[#0d1117] py-4 text-center md:max-w-none">
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1">
              <RatingStarSolidIcon className="h-[18px] w-[18px] shrink-0 text-amber-400" />
              <span className="text-lg font-extrabold text-white">
                {ratingAvg.toFixed(1)}
              </span>
            </div>
            <span className="mt-1 text-[12px] text-[#8b95b0]">
              {ratingCount} review{ratingCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-[#1e2536] px-1">
            <span className="text-lg font-extrabold text-white">
              {formatCompact(followers)}
            </span>
            <span className="mt-1 text-[12px] text-[#8b95b0]">Followers</span>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-[#1e2536] px-1">
            <span className="text-lg font-extrabold text-white">
              {formatCompact(bookingsStat)}
            </span>
            <span className="mt-1 text-[12px] text-[#8b95b0]">Bookings</span>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-[#1e2536] px-1">
            <span className="text-lg font-extrabold text-white">
              {dj.hourly_rate != null &&
              Number.isFinite(dj.hourly_rate) &&
              dj.hourly_rate > 0
                ? formatUsdHourly(dj.hourly_rate)
                : "—"}
            </span>
            <span className="mt-1 text-[12px] text-[#8b95b0]">per hour</span>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={followBusyAny}
            onClick={() => handleFollow()}
            className={`flex min-h-11 min-w-[132px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              isFollowing
                ? "border border-[#8b5cf6] bg-transparent text-[#8b5cf6]"
                : "border border-transparent bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
            } ${followBusyAny ? "opacity-50" : ""}`}
          >
            <span aria-hidden>{isFollowing ? "✓" : "＋"}</span>
            {followBusyAny ? "…" : isFollowing ? "Following" : "Follow"}
          </button>
          <button
            type="button"
            onClick={handleBook}
            className="flex min-h-11 min-w-[180px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-4 text-sm font-bold text-white transition hover:bg-[#7c3aed]"
          >
            <span aria-hidden>📅</span>
            Book DJ · {hourlyLabel}
          </button>
          <button
            type="button"
            onClick={handleTip}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8b5cf6] bg-transparent text-[#8b5cf6] transition hover:bg-[#8b5cf6]/10"
            aria-label="Tip DJ"
            title="Tip DJ"
          >
            🎁
          </button>
        </section>

        {dj.is_live ? (
          <button
            type="button"
            onClick={handleWatchLive}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#dc2626] px-4 py-3.5 text-left transition hover:bg-[#b91c1c]"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white" />
            <span className="flex-1 font-semibold text-white">
              Currently streaming live
            </span>
            <span className="text-2xl" aria-hidden>
              ▶
            </span>
          </button>
        ) : null}

        <section>
          <h3 className="mb-3 text-lg font-bold text-white">About</h3>
          <p className="text-[15px] leading-relaxed text-[#c7d0ff]">
            {bioText}
          </p>
        </section>

        <section>
          <h3 className="mb-3 text-lg font-bold text-white">Genres</h3>
          {genres.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, idx) => {
                const key = `${genre}-${idx}`;
                return (
                  <span
                    key={key}
                    className="rounded-full border border-[#1e2536] bg-[#0d1117] px-3.5 py-2 text-sm font-semibold text-[#e7ecff]"
                  >
                    {genre}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-[15px] text-[#8b95b0]">No genres listed yet.</p>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-lg font-bold text-white">Availability</h3>
          <div className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden>
                📅
              </span>
              <p className="flex-1 text-[15px] font-medium text-[#e7ecff]">
                {availabilityLine ??
                  "Detailed hours are confirmed when you send a booking request."}
              </p>
            </div>
            <p className="mt-2 text-sm text-[#8b95b0]">
              Use Book below to propose a date and time.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Reviews</h3>
            <div className="flex items-center gap-3">
              {reviewsFetching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
              ) : null}
              <button
                type="button"
                onClick={openReviewModal}
                className="text-sm font-semibold"
                style={{ color: ACCENT }}
              >
                Write review
              </button>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-[15px] text-[#8b95b0]">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r, idx) => {
                const body = reviewBody(r);
                const author = reviewAuthorLabel(r);
                const dateStr = formatReviewDate(r.created_at ?? null);
                const stars = reviewStarCount(r);
                const reviewKey =
                  r.id && r.id.length > 0 ? r.id : `review-${idx}`;
                const reviewerAvatarFallback = `https://picsum.photos/seed/rev-${encodeURIComponent(String(r.id ?? idx))}/80/80`;
                const revAvatarRaw = r.reviewer_avatar_url
                  ? toHttpsAvatarUrl(r.reviewer_avatar_url)
                  : reviewerAvatarFallback;
                const revAvatar = revAvatarRaw || reviewerAvatarFallback;

                return (
                  <li
                    key={reviewKey}
                    className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={revAvatar}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full bg-[#070b12] object-cover"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold text-white">
                            {author}
                          </span>
                          {dateStr ? (
                            <span className="text-xs text-[#8b95b0]">
                              {dateStr}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex gap-0.5" aria-hidden>
                          {Array.from({ length: stars }, (_, starIdx) => (
                            <RatingStarSolidIcon
                              key={`${reviewKey}-s${starIdx}`}
                              className="h-3.5 w-3.5 text-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {body ? (
                      <p className="mt-3 text-sm leading-relaxed text-[#c7d0ff]">
                        {body}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {reviewModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-transparent"
            aria-label="Close dialog backdrop"
            onClick={reviewSubmitting ? undefined : closeReviewModal}
          />
          <div className="relative z-[1] w-full max-w-md rounded-2xl border border-[#1e2536] bg-[#11193e] p-5 shadow-xl">
            <h2
              id="review-modal-title"
              className="mb-3 text-lg font-bold text-white"
            >
              Write a review
            </h2>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8b95b0]">
              Rating
            </p>
            <div className="mb-1 flex justify-between">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => setReviewRating(n)}
                  className={`rounded-lg p-1 transition hover:bg-white/10 ${
                    n === reviewRating ? "ring-2 ring-[#fbbf24]/50" : ""
                  }`}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  aria-pressed={n === reviewRating}
                >
                  {n <= reviewRating ? (
                    <RatingStarSolidIcon className="h-[34px] w-[34px] text-amber-400" />
                  ) : (
                    <RatingStarOutlineIcon className="h-[34px] w-[34px] text-[#8b95b0]" />
                  )}
                </button>
              ))}
            </div>
            <p className="mb-4 text-sm font-semibold text-[#8b95b0]">
              {reviewRating} out of 5
            </p>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8b95b0]">
              Comment
            </p>
            <textarea
              value={reviewDraft}
              onChange={(e) => setReviewDraft(e.target.value)}
              placeholder="Share your experience…"
              rows={5}
              disabled={reviewSubmitting}
              className="w-full resize-y rounded-xl border border-[#1e2536] bg-[#0d1117] p-3 text-[15px] text-[#e7ecff] outline-none placeholder:text-[#8b95b0] focus:border-[#6366f1]"
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={closeReviewModal}
                className="rounded-lg px-4 py-2 text-[15px] font-semibold text-[#8b95b0] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={submitReview}
                className="rounded-xl bg-[#8b5cf6] px-5 py-2 text-[15px] font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
              >
                {reviewSubmitting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
