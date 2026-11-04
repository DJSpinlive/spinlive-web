"use client";

import { useState } from "react";

import {
  RatingStarOutlineIcon,
  RatingStarSolidIcon,
} from "@/components/assets";
import {
  useCreateBookingReviewMutation,
  useGetBookingReviewQuery,
  useUpdateBookingReviewMutation,
} from "@/store/api";
import { getErrorMessage } from "@/utilities/helpers";

const STAR_VALUES = [1, 2, 3, 4, 5];

/** Event review for a completed booking: one per booking, editable by its author. */
export function BookingReviewCard({ bookingId }: { bookingId: string }) {
  const {
    data: review,
    isLoading,
    error: loadError,
  } = useGetBookingReviewQuery(bookingId);
  const [createReview, { isLoading: creating }] =
    useCreateBookingReviewMutation();
  const [updateReview, { isLoading: updating }] =
    useUpdateBookingReviewMutation();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const saving = creating || updating;

  /** 404 means no review yet; anything else is a real load failure. */
  const noReview =
    !review && (loadError as { status?: unknown } | undefined)?.status === 404;

  const startEditing = () => {
    setRating(review?.rating ?? 5);
    setComment(review?.comment ?? "");
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    setError(null);
    const body = { bookingId, rating, comment: comment.trim() || undefined };
    try {
      if (review) {
        await updateReview(body).unwrap();
      } else {
        await createReview(body).unwrap();
      }
      setEditing(false);
    } catch (e) {
      setError(
        getErrorMessage(e, { fallbackMessage: "Could not save your review." })
      );
    }
  };

  if (isLoading) return null;

  return (
    <section className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Rate this event</h2>
        {!editing && (review || noReview) ? (
          <button
            type="button"
            onClick={startEditing}
            className="text-sm font-semibold text-[#8b5cf6]"
          >
            {review ? "Edit review" : "Write review"}
          </button>
        ) : null}
      </div>

      {editing ? (
        <div>
          <div className="mb-3 flex gap-1">
            {STAR_VALUES.map((n) => (
              <button
                key={n}
                type="button"
                disabled={saving}
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                aria-pressed={n === rating}
                className="rounded-lg p-1 transition hover:bg-white/10"
              >
                {n <= rating ? (
                  <RatingStarSolidIcon className="h-8 w-8 text-amber-400" />
                ) : (
                  <RatingStarOutlineIcon className="h-8 w-8 text-[#8b95b0]" />
                )}
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How did the event go?"
            rows={4}
            disabled={saving}
            className="w-full resize-y rounded-xl border border-[#1e2536] bg-[#070b12] p-3 text-[15px] text-[#e7ecff] outline-none placeholder:text-[#8b95b0] focus:border-[#6366f1]"
          />
          {error ? (
            <p role="alert" className="mt-2 text-sm text-[#fca5a5]">
              {error}
            </p>
          ) : null}
          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setEditing(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[#8b95b0] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded-xl bg-[#8b5cf6] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save review"}
            </button>
          </div>
        </div>
      ) : null}

      {!editing && review ? (
        <div>
          <div className="flex gap-0.5" aria-label={`${review.rating} of 5`}>
            {STAR_VALUES.map((n) =>
              n <= review.rating ? (
                <RatingStarSolidIcon
                  key={n}
                  className="h-4 w-4 text-amber-400"
                />
              ) : (
                <RatingStarOutlineIcon
                  key={n}
                  className="h-4 w-4 text-[#5f6983]"
                />
              )
            )}
          </div>
          {review.comment ? (
            <p className="mt-2 text-sm leading-relaxed text-[#c7d0ff]">
              {review.comment}
            </p>
          ) : null}
        </div>
      ) : null}

      {!editing && noReview ? (
        <p className="text-sm text-[#8b95b0]">
          Tell others how the event went.
        </p>
      ) : null}

      {!editing && !review && !noReview ? (
        <p className="text-sm text-[#8b95b0]">Could not load your review.</p>
      ) : null}
    </section>
  );
}
