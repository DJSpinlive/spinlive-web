"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  useCreateBookingMutation,
  useGetBookingAvailabilityQuery,
} from "@/store/api/bookingsApi";
import { useDjDetailQuery } from "@/store/api/djApi";
import { useGetUserQuery } from "@/store/api/userApi";
import type { AvailabilityWindow } from "@/types/bookings.types";
import { getErrorMessage } from "@/utilities/helpers";

const eventTypes = [
  { id: "private", label: "Private Party" },
  { id: "club", label: "Club / Lounge" },
  { id: "corporate", label: "Corporate" },
  { id: "virtual", label: "Virtual Stream" },
];

const durations = [
  { value: "1", label: "1 Hour" },
  { value: "2", label: "2 Hours" },
  { value: "3", label: "3 Hours" },
  { value: "4", label: "4 Hours" },
  { value: "5", label: "5 Hours" },
  { value: "6", label: "6+ Hours" },
];

const defaultAvailableSlots = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

function toTimeParts(time: string) {
  const [clock, period] = time.split(" ");
  const [hh, mm] = clock.split(":").map(Number);
  const isPm = period?.toUpperCase() === "PM";
  let hour = hh % 12;
  if (isPm) hour += 12;
  return { hour, minute: mm || 0, second: 0, nano: 0 };
}

interface SlotOption {
  label: string;
  isBooked: boolean;
}

export default function BookDJPage() {
  const params = useParams<{ id: string }>();
  const djId = params?.id || "";
  const [eventType, setEventType] = useState("private");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("4");
  const [location, setLocation] = useState("");
  const [requests, setRequests] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { data: dj } = useDjDetailQuery(djId, { skip: !djId });
  const { data: me } = useGetUserQuery();
  const { data: availability } = useGetBookingAvailabilityQuery(
    { djId, date },
    { skip: !djId || !date }
  );
  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();

  const hourlyRate = dj?.hourly_rate || 0;
  const hours = parseInt(duration, 10) || 0;
  const subtotal = hourlyRate * hours;
  const serviceFee = 30;
  const total = subtotal + serviceFee;

  const slotsForSelectedDate = useMemo<SlotOption[]>(() => {
    if (!date) return [];
    const apiSlots = availability?.availableSlots?.map(
      (slot: AvailabilityWindow) => {
        const [h, m] = slot.startTime.split(":").map(Number);
        const d = new Date();
        d.setHours(h || 0, m || 0, 0, 0);
        return {
          label: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          isBooked: false,
        };
      }
    );
    if (apiSlots?.length) return apiSlots;
    return defaultAvailableSlots.map((slot) => ({
      label: slot,
      isBooked: false,
    }));
  }, [availability?.availableSlots, date]);

  useEffect(() => {
    if (!date || !time) return;

    const selectedSlot = slotsForSelectedDate.find(
      (slot) => slot.label === time
    );
    if (!selectedSlot || selectedSlot.isBooked) {
      setTime("");
    }
  }, [date, slotsForSelectedDate, time]);

  const handleConfirmBooking = async () => {
    if (!me?.id || !djId || !date || !time || !location) {
      setSubmitError("Select date, time, and location to continue.");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const start = toTimeParts(time);
      await createBooking({
        fanId: me.id,
        djId,
        eventType,
        eventDate: date,
        startTime: start,
        endTime: {
          ...start,
          hour: (start.hour + hours) % 24,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        locationType: "venue",
        venueName: location,
        venueAddress: location,
        genreNotes: dj?.genres?.join(", ") || "",
        specialRequests: requests,
        guestCount: 1,
        budgetAmount: total,
        currency: "USD",
      }).unwrap();
      setSubmitSuccess("Booking request submitted successfully.");
    } catch (error: unknown) {
      setSubmitError(
        getErrorMessage(error, {
          fallbackMessage: "Could not create booking right now.",
        })
      );
    }
  };

  return (
    <div className="pb-10">
      <div className="mb-6">
        <Link
          href="/djs"
          className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
        >
          ← Back to DJs
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">Book DJ</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-[#1e2536] bg-[#0d1117] p-4">
            <Image
              src={
                dj?.avatar_url ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
              }
              alt={dj?.display_name || "DJ"}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-[#1e2536]"
              unoptimized
            />
            <div>
              <h2 className="text-lg font-semibold text-white">
                {dj?.display_name || "DJ"}
              </h2>
              <p className="text-sm text-[#6b7280]">
                {dj?.genres?.length ? dj.genres.join(" • ") : "Open format"}
              </p>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-[#fbbf24]">
                  ★ {dj?.rating_avg || 0}
                </span>
                <span className="text-white">${hourlyRate}/hr</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1e2536] bg-[#0d1117] p-5">
            <div className="space-y-5">
              <div>
                <p className="mb-3 block text-sm font-medium text-white">
                  Event Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setEventType(type.id)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        eventType === type.id
                          ? "bg-[#8b5cf6] text-white"
                          : "border border-[#1e2536] bg-[#070b12] text-[#9ca3af] hover:border-[#2d3548] hover:text-white"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 block text-sm font-medium text-white">
                  Date & Time
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#1e2536] bg-[#070b12] px-4 text-sm text-white outline-none transition focus:border-[#6366f1] [color-scheme:dark]"
                    />
                  </div>
                  <div className="rounded-xl border border-[#1e2536] bg-[#070b12] px-4 py-3">
                    {/* <p className="text-xs uppercase tracking-wide text-[#6b7280]">
                      Selected Time
                    </p> */}
                    <p className="mt-1 text-sm text-white">
                      {time || "Choose a time slot below"}
                    </p>
                  </div>
                </div>

                {!date ? (
                  <p className="mt-3 text-xs text-[#6b7280]">
                    Select a date to view available and booked DJ time slots.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                        Available
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#374151]" />
                        Booked
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {slotsForSelectedDate.map((slot) => (
                        <button
                          key={slot.label}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setTime(slot.label)}
                          className={`rounded-lg px-3 py-2 text-sm transition ${
                            slot.isBooked
                              ? "cursor-not-allowed border border-[#293041] bg-[#111827] text-[#6b7280]"
                              : time === slot.label
                                ? "bg-[#8b5cf6] text-white"
                                : "border border-[#1e2536] bg-[#070b12] text-[#d1d5db] hover:border-[#3a4a69]"
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 block text-sm font-medium text-white">
                  Duration
                </p>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-[#1e2536] bg-[#070b12] px-4 pr-10 text-sm text-white outline-none transition focus:border-[#6366f1]"
                  >
                    {durations.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
                    ▼
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-3 block text-sm font-medium text-white">
                  Location
                </p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter venue address or link"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#1e2536] bg-[#070b12] px-4 pr-10 text-sm text-white outline-none transition placeholder:text-[#4b5563] focus:border-[#6366f1]"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
                    📍
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-3 block text-sm font-medium text-white">
                  Special Requests (Optional)
                </p>
                <textarea
                  placeholder="Add any specific song requests, dress code, or event details here..."
                  value={requests}
                  onChange={(e) => setRequests(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#1e2536] bg-[#070b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#4b5563] focus:border-[#6366f1]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-[#1e2536] bg-[#0d1117] p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Booking Summary
            </h3>

            <div className="space-y-3 border-b border-[#1e2536] pb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">
                  ${hourlyRate}/hr × {hours} hours
                </span>
                <span className="text-white">${subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">Service Fee</span>
                <span className="text-white">${serviceFee}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-base font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-white">${total}</span>
            </div>

            {submitError && (
              <p className="mt-4 rounded-lg border border-[#f87171]/50 bg-[#3c1f2a]/60 px-3 py-2 text-sm text-[#fecaca]">
                {submitError}
              </p>
            )}
            {submitSuccess && (
              <p className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {submitSuccess}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isCreatingBooking}
              className="mt-5 h-12 w-full rounded-xl bg-[#8b5cf6] text-sm font-semibold text-white transition hover:bg-[#7c4ddb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingBooking ? "Submitting..." : "Confirm Booking"}
            </button>

            <p className="mt-3 text-center text-xs text-[#6b7280]">
              You won&apos;t be charged until the DJ confirms your booking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
