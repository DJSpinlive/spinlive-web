"use client";

import Image from "next/image";
import Link from "next/link";

import {
  BellIcon,
  CalendarIcon,
  CreditCardIcon,
  EditPencilIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@/components/assets";

const userProfile = {
  name: "Alex Morgan",
  username: "@alexmixesfan",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  bio: "A fan-first account for discovering live DJ sets, sending requests, and booking unforgettable events.",
  stats: {
    bookings: 8,
    following: 24,
    tipsSent: 186,
  },
};

const settingsItems = [
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
    href: "/profile/notifications",
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

function SettingsIcon({ icon }: { icon: SettingsItemIcon }) {
  const iconClass = "h-5 w-5";

  switch (icon) {
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
  return (
    <div className="pb-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
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
              <Image
                src={userProfile.avatar}
                alt={userProfile.name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[#1e2536]"
                unoptimized
              />
              <h2 className="mt-4 text-xl font-semibold text-white">
                {userProfile.name}
              </h2>
              <p className="text-sm text-[#6b7280]">{userProfile.username}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                {userProfile.bio}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-[#1e2536] border-y border-[#1e2536] py-4">
              <div className="text-center">
                <p className="text-xs text-[#6b7280]">Bookings</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {userProfile.stats.bookings}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#6b7280]">Following</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {userProfile.stats.following} DJs
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#6b7280]">Tips sent</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  ${userProfile.stats.tipsSent}
                </p>
              </div>
            </div>

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
