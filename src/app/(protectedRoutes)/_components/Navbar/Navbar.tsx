"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BellIcon, SearchIconOutline } from "@/components/assets";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

import { ProfileMenu } from "./ProfileMenu";

const navLinks = [
  { href: "/home", label: "Discover" },
  { href: "/live", label: "Live Now" },
  { href: "/djs", label: "DJs" },
  { href: "/bookings", label: "My Bookings" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="mb-6 flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-10">
        <Link href="/home" aria-label="SpinLive home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/home"
                ? pathname === "/home"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#1a1f2e] text-white"
                    : "text-[#8b95b0] hover:bg-[#12161f] hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-10 w-[280px] items-center gap-2 rounded-xl border border-[#1e2536] bg-[#0d1117] px-3 lg:flex">
          <SearchIconOutline className="h-4 w-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search DJs, genres, events..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#4b5563]"
          />
        </div>

        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e2536] bg-[#0d1117] transition hover:border-[#2d3548]"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5 text-[#9ca3af]" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-medium text-white">
            3
          </span>
        </Link>

        <ProfileMenu />
      </div>
    </header>
  );
}
