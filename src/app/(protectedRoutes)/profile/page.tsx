"use client";

import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import {
  BellIcon,
  CalendarIcon,
  CreditCardIcon,
  EditPencilIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@/components/assets";
import { RemoteAvatarImage } from "@/components/RemoteAvatarImage/RemoteAvatarImage";
import { useGetUserQuery } from "@/store/api";
import type { User } from "@/types/user.types";

const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop";

const settingsItems = [
  {
    id: "preferences",
    icon: "sliders",
    title: "Preferences",
    description:
      "Favorite genres, discovery defaults for DJs and streams, and booking budget.",
    href: "/profile/preferences",
  },
  {
    id: "verification",
    icon: "shield-check",
    title: "Verification & trust",
    description:
      "Identity checks, safer transactions, and moderation support for bookings and live interactions.",
    href: "/profile/verification",
  },
  {
    id: "payment",
    icon: "credit-card",
    title: "Payment configuration",
    description:
      "Manage cards, receipts, tipping history, and Stripe checkout preferences from one place.",
    href: "/profile/payment",
  },
  {
    id: "bookings",
    icon: "calendar",
    title: "Bookings & event history",
    description:
      "Track upcoming events, revisit past bookings, and review private or public show details.",
    href: "/bookings",
  },
  {
    id: "notifications",
    icon: "bell",
    title: "Notifications & live alerts",
    description:
      "Choose when to get notified about favorite DJs, song requests, booking replies, and stream reminders.",
    href: "/notifications",
  },
  {
    id: "privacy",
    icon: "lock",
    title: "Privacy, safety & support",
    description:
      "Report issues, manage blocked users, and access help for disputes or moderation concerns.",
    href: "/profile/privacy",
  },
] as const;

type SettingsItemIcon = (typeof settingsItems)[number]["icon"];

function displayHandle(user: User): string {
  const name = user.display_name?.trim();
  if (name) {
    return `@${name.replace(/\s+/g, "").toLowerCase()}`;
  }
  const local = user.email?.split("@")[0]?.toLowerCase();
  return local ? `@${local}` : "@you";
}

function displayName(user: User): string {
  return user.display_name?.trim() || user.email?.split("@")[0] || "Profile";
}

function StatsRow({ user }: { user: User }) {
  const bookings = user.bookings_created_count ?? 0;
  const following = user.following_count ?? 0;
  const tips = user.tips_sent_count ?? 0;

  return (
    <div className="mt-6 grid grid-cols-3 divide-x divide-[#1e2536] border-y border-[#1e2536] py-4">
      <div className="text-center">
        <p className="text-xs text-[#6b7280]">Bookings</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {bookings.toLocaleString()}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-[#6b7280]">Following</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {following.toLocaleString()} DJs
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-[#6b7280]">Tips sent</p>
        <p className="mt-1 text-lg font-semibold text-white">${tips}</p>
      </div>
    </div>
  );
}

function SettingsIcon({ icon }: { icon: SettingsItemIcon }) {
  const iconClass = "h-5 w-5";

  switch (icon) {
    case "sliders":
      return <SlidersHorizontal className={iconClass} />;
    case "shield-check":
      return <ShieldCheckIcon className={iconClass} />;
    case "credit-card":
      return <CreditCardIcon className={iconClass} />;
    case "calendar":
      return <CalendarIcon className={iconClass} />;
    case "bell":
      return <BellIcon className={iconClass} />;
    case "lock":
      return <LockClosedIcon className={iconClass} />;
    default:
      return null;
  }
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-5 w-5 text-[#6b7280]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const {
    data: user,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetUserQuery();

  if (isLoading && !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 pb-10">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
        <p className="text-sm text-[#9ca3af]">Loading your profile…</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 pb-10 text-center">
        <p className="text-lg font-semibold text-white">
          Could not load profile
        </p>
        <p className="max-w-md text-sm text-[#9ca3af]">
          Check your connection or sign in again, then retry.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7c4ddb]"
        >
          Retry
        </button>
      </div>
    );
  }

  const bioTrimmed = user.bio?.trim();
  const bioText =
    bioTrimmed && bioTrimmed.length > 0
      ? bioTrimmed
      : "No bio yet — tell others what sets and events you enjoy.";

  const roleLabel =
    user.role === "dj" ? "DJ" : user.role === "admin" ? "Admin" : "Listener";

  return (
    <div className="pb-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          Profile
          {isFetching ? (
            <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[#8b5cf6]" />
          ) : null}
        </h1>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e2536] bg-[#0d1117] transition hover:border-[#2d3548]"
          aria-label="Settings"
        >
          <svg
            className="h-5 w-5 text-[#9ca3af]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-6">
            <div className="flex flex-col items-center text-center">
              <RemoteAvatarImage
                uri={user.avatar_url || ""}
                fallbackUri={AVATAR_FALLBACK}
                alt={displayName(user)}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[#1e2536]"
              />
              <h2 className="mt-4 text-xl font-semibold text-white">
                {displayName(user)}
              </h2>
              <p className="text-sm text-[#6b7280]">{displayHandle(user)}</p>
              <span className="mt-2 rounded-full bg-[#1a2234] px-3 py-0.5 text-xs font-medium text-[#9ca3af]">
                {roleLabel}
                {user.kyc_verified ? " · Verified" : ""}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                {bioText}
              </p>
            </div>

            <StatsRow user={user} />

            <div className="mt-6 flex gap-3">
              <Link
                href="/profile/edit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] py-3 text-sm font-semibold text-white transition hover:bg-[#7c4ddb]"
              >
                <EditPencilIcon className="h-4 w-4" />
                Edit profile
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            Account & settings
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">
            Everything needed for a trusted live DJ platform: profile info,
            safety, bookings, and payments.
          </p>

          <div className="mt-5 space-y-3">
            {settingsItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-4 rounded-xl border border-[#1e2536] bg-[#0d1117] p-4 transition hover:border-[#2d3548] hover:bg-[#141a24]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#1a2234] text-[#8b5cf6]">
                  <SettingsIcon icon={item.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white">{item.title}</h4>
                  <p className="mt-0.5 text-sm text-[#6b7280] line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <ChevronRightIcon />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
