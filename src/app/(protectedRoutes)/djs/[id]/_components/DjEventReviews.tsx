"use client";

import { RatingStarSolidIcon } from "@/components/assets";
import { useGetDjBookingReviewsQuery } from "@/store/api";
import { formatReviewDate } from "@/utilities/dj-profile-helpers";

/** Reviews left on completed bookings (booking svc), separate from profile reviews. */
export function DjEventReviews({ djId }: { djId: string }) {
  const { data: reviews = [], isLoading } = useGetDjBookingReviewsQuery(djId);

  if (isLoading || reviews.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-lg font-bold text-white">
        Event reviews{" "}
        <span className="text-sm font-medium text-[#8b95b0]">
          ({reviews.length})
        </span>
      </h3>
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold text-white">
                {review.reviewerDisplayName?.trim() || "SpinLive user"}
              </span>
              <span className="text-xs text-[#8b95b0]">
                {formatReviewDate(review.createdAt)}
              </span>
            </div>
            <div
              className="mt-1 flex gap-0.5"
              aria-label={`${review.rating} of 5`}
            >
              {Array.from({ length: review.rating }, (_, i) => (
                <RatingStarSolidIcon
                  key={`${review.id}-s${i}`}
                  className="h-3.5 w-3.5 text-amber-400"
                />
              ))}
            </div>
            {review.comment ? (
              <p className="mt-2 text-sm leading-relaxed text-[#c7d0ff]">
                {review.comment}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
