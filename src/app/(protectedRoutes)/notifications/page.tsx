"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheckIcon,
  BellIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
} from "@/components/assets";

type NotificationType =
  | "live"
  | "booking_confirmed"
  | "upcoming_event"
  | "badge_earned"
  | "platform_update";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  djName?: string;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "live",
    title: "DJ Apex is Live",
    message: "Jump in now to hear his exclusive set.",
    time: "Just now",
    isRead: false,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    djName: "DJ Apex",
    actionUrl: "/live/1",
  },
  {
    id: "2",
    type: "booking_confirmed",
    title: "Booking Confirmed",
    message: "Sarah Beats accepted your booking request for Friday night.",
    time: "1h ago",
    isRead: false,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    djName: "Sarah Beats",
    actionUrl: "/bookings",
  },
  {
    id: "3",
    type: "upcoming_event",
    title: "Upcoming Event",
    message: "Your private event with Marcus Vibe starts in 24 hours.",
    time: "3h ago",
    isRead: true,
    actionUrl: "/bookings",
  },
  {
    id: "4",
    type: "badge_earned",
    title: "Top Tipper Badge Earned",
    message: "You've been recognized as a top supporter on the platform.",
    time: "1d ago",
    isRead: true,
  },
  {
    id: "5",
    type: "platform_update",
    title: "New House DJs",
    message: "We've added 5 new featured DJs in the House genre. Check them out!",
    time: "2d ago",
    isRead: true,
    actionUrl: "/djs",
  },
];

type TabType = "all" | "unread";

function NotificationIcon({ type }: { type: NotificationType }) {
  const iconWrapperClass =
    "flex h-12 w-12 items-center justify-center rounded-full bg-[#1a2234]";

  switch (type) {
    case "upcoming_event":
      return (
        <div className={iconWrapperClass}>
          <div className="relative">
            <CalendarIcon className="h-6 w-6 text-[#9ca3af]" />
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0d1117]">
              <ClockIcon className="h-3 w-3 text-[#8b5cf6]" />
            </div>
          </div>
        </div>
      );
    case "badge_earned":
      return (
        <div className={iconWrapperClass}>
          <BadgeCheckIcon className="h-6 w-6 text-[#9ca3af]" />
        </div>
      );
    case "platform_update":
      return (
        <div className={iconWrapperClass}>
          <StarIcon className="h-6 w-6 text-[#8b5cf6]" />
        </div>
      );
    default:
      return null;
  }
}

function NotificationAvatar({
  notification,
}: {
  notification: Notification;
}) {
  if (!notification.avatar) return null;

  const isLive = notification.type === "live";
  const isConfirmed = notification.type === "booking_confirmed";

  return (
    <div className="relative flex-shrink-0">
      <Image
        src={notification.avatar}
        alt={notification.djName || ""}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
        unoptimized
      />
      {isLive && (
        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0d1117] bg-red-500">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      )}
      {isConfirmed && (
        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0d1117] bg-emerald-500">
          <CheckIcon className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const hasAvatar = notification.type === "live" || notification.type === "booking_confirmed";

  const content = (
    <div
      className={`flex items-start gap-4 rounded-xl p-4 transition ${
        notification.actionUrl ? "hover:bg-[#141a24]" : ""
      }`}
    >
      {hasAvatar ? (
        <NotificationAvatar notification={notification} />
      ) : (
        <NotificationIcon type={notification.type} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white">{notification.title}</h3>
            <p className="mt-0.5 text-sm text-[#9ca3af] leading-relaxed">
              {notification.message}
            </p>
            {notification.type !== "live" && (
              <p className="mt-1.5 text-xs text-[#6b7280]">{notification.time}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {notification.type === "live" && (
              <Link
                href={notification.actionUrl || "#"}
                className="rounded-full bg-[#8b5cf6] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#7c4ddb]"
                onClick={(e) => e.stopPropagation()}
              >
                Join
              </Link>
            )}
            {!notification.isRead && (
              <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#8b5cf6]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (notification.actionUrl && notification.type !== "live") {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    activeTab === "all"
      ? mockNotifications
      : mockNotifications.filter((n) => !n.isRead);

  return (
    <div className="pb-10">
      <div className="mb-6">
        <Link
          href="/home"
          className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
        >
          ← Back
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">Notifications</h1>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === "all"
              ? "bg-white text-[#0d1117]"
              : "bg-[#1a2234] text-[#9ca3af] hover:bg-[#242f44] hover:text-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === "unread"
              ? "bg-white text-[#0d1117]"
              : "bg-[#1a2234] text-[#9ca3af] hover:bg-[#242f44] hover:text-white"
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      <div className="rounded-2xl border border-[#1e2536] bg-[#0d1117] divide-y divide-[#1e2536]">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a2234]">
              <BellIcon className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-white">
              No notifications
            </h3>
            <p className="text-sm text-[#6b7280]">
              {activeTab === "all"
                ? "You're all caught up!"
                : "No unread notifications."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
}
