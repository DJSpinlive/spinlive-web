"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarIcon, LocationPinIcon } from "@/components/assets";
import { useGetBookingsQuery } from "@/store/api";
import type { Booking } from "@/types/bookings.types";
import {
  bookingListTab,
  bookingStatusHeadline,
  bookingUiStatus,
  formatBookingDateTile,
  formatBookingLocation,
  formatBookingMoney,
  formatBookingTimeRange,
} from "@/utilities/booking-helpers";

type TabType = "upcoming" | "pending" | "past";

const tabs: { id: TabType; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "past", label: "Past" },
];

function getStatusBadge(status: "confirmed" | "pending" | "cancelled" | "completed") {
  const styles = {
    confirmed:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    pending: "bg-transparent text-amber-400 border border-amber-400",
    cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
    completed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  };

  const labels = {
    confirmed: "CONFIRMED",
    pending: "PENDING",
    cancelled: "CANCELLED",
    completed: "COMPLETED",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const { month, day } = formatBookingDateTile(booking);
  const uiStatus = bookingUiStatus(booking);

  return (
    <div className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-4">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#1a2234]">
          <span className="text-[10px] font-semibold tracking-wider text-amber-400">
            {month}
          </span>
          <span className="text-xl font-bold text-white">{day}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white truncate">
                {bookingStatusHeadline(booking)}
              </h3>
              <p className="text-sm text-[#6b7280]">
                {formatBookingTimeRange(booking)}
              </p>
            </div>
            {getStatusBadge(uiStatus)}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
          <LocationPinIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formatBookingLocation(booking)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center font-medium">
            $
          </span>
          <span>{formatBookingMoney(booking.finalAmount, booking.currency)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#1e2536] pt-4">
        <p className="text-sm text-[#6b7280]">
          DJ: <span className="text-white">{booking.djDisplayName}</span>
        </p>
        <span className="text-xs text-[#6b7280]">{booking.eventType}</span>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const { data: bookings = [], isLoading } = useGetBookingsQuery({});

  const pendingCount = bookings.filter((b) => bookingListTab(b) === "pending").length;

  const filteredBookings = bookings.filter((booking) => {
    switch (activeTab) {
      case "upcoming":
        return bookingListTab(booking) === "upcoming";
      case "pending":
        return bookingListTab(booking) === "pending";
      case "past":
        return bookingListTab(booking) === "past";
      default:
        return true;
    }
  });

  return (
    <div className="pb-10">
      <div className="mb-6">
        <Link
          href="/home"
          className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
        >
          ← Back
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">Bookings</h1>
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-[#0d1117]"
                : "bg-[#1a2234] text-[#9ca3af] hover:bg-[#242f44] hover:text-white"
            }`}
          >
            {tab.label}
            {tab.id === "pending" && pendingCount > 0 && (
              <span className="ml-1.5">({pendingCount})</span>
            )}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e2536] bg-[#0d1117] py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a2234]">
            <CalendarIcon className="h-8 w-8 text-[#6b7280]" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">
            {isLoading ? "Loading bookings..." : `No ${activeTab} bookings`}
          </h3>
          <p className="text-sm text-[#6b7280]">
            {isLoading && "Fetching your bookings from the API."}
            {!isLoading && activeTab === "upcoming" &&
              "You don't have any confirmed bookings yet."}
            {!isLoading && activeTab === "pending" &&
              "No bookings are awaiting confirmation."}
            {!isLoading && activeTab === "past" && "Your past bookings will appear here."}
          </p>
          {activeTab !== "past" && (
            <Link
              href="/djs"
              className="mt-4 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c4ddb]"
            >
              Browse DJs
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
