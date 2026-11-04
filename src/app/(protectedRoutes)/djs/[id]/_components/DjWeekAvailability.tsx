"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useGetBookingAvailabilityRangeQuery } from "@/store/api";
import {
  formatMinutesFromMidnightPickLabel,
  parseTimeOfDayToMinutes,
  toBookingEventDateIso,
} from "@/utilities/booking-helpers";

const DAYS_AHEAD = 7;

function dayLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Free windows for the next week, from `/bookings/djs/{id}/availability/range`. */
export function DjWeekAvailability({ djId }: { djId: string }) {
  const { startDate, endDate } = useMemo(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + DAYS_AHEAD - 1);
    return {
      startDate: toBookingEventDateIso(start),
      endDate: toBookingEventDateIso(end),
    };
  }, []);

  const { data: days = [], isLoading } = useGetBookingAvailabilityRangeQuery({
    djId,
    startDate,
    endDate,
  });

  if (isLoading) {
    return <p className="text-sm text-[#8b95b0]">Loading availability…</p>;
  }

  if (days.length === 0) {
    return (
      <p className="text-sm text-[#8b95b0]">
        Availability is confirmed when you send a booking request.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#1e2536] rounded-2xl border border-[#1e2536] bg-[#0d1117]">
      {days.map((day) => {
        const free = day.availableSlots ?? [];
        return (
          <li
            key={day.date}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <span className="text-sm font-semibold text-white">
              {dayLabel(day.date)}
            </span>
            {free.length === 0 ? (
              <span className="text-xs text-[#6b7280]">Unavailable</span>
            ) : (
              <span className="flex flex-wrap justify-end gap-1.5">
                {free.slice(0, 3).map((slot) => (
                  <span
                    key={`${day.date}-${slot.startTime}`}
                    className="rounded-full border border-[#1e2536] px-2.5 py-1 text-xs text-[#c7d0ff]"
                  >
                    {formatMinutesFromMidnightPickLabel(
                      parseTimeOfDayToMinutes(slot.startTime)
                    )}
                    –
                    {formatMinutesFromMidnightPickLabel(
                      parseTimeOfDayToMinutes(slot.endTime)
                    )}
                  </span>
                ))}
                {free.length > 3 ? (
                  <span className="px-1 py-1 text-xs text-[#8b95b0]">
                    +{free.length - 3} more
                  </span>
                ) : null}
              </span>
            )}
          </li>
        );
      })}
      <li className="px-4 py-3">
        <Link
          href={`/djs/${djId}/book`}
          className="text-sm font-semibold text-[#8b5cf6]"
        >
          Pick a time and book →
        </Link>
      </li>
    </ul>
  );
}
