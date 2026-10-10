"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { RemoteAvatarImage } from "@/components/RemoteAvatarImage/RemoteAvatarImage";
import { useClickOutside } from "@/hooks";
import { cn } from "@/lib/utils";
import { useGetUserQuery, useLogoutUserMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { clearAllAuthCookies } from "@/utilities/clientCookies";

const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop";

const menuLinks = [
  { href: "/profile", label: "View profile" },
  { href: "/profile/edit", label: "Edit profile" },
  { href: "/profile/preferences", label: "Settings" },
] as const;

/** Two-letter monogram from a display name, falling back to the email local part. */
function initialsFor(name: string | null | undefined, email?: string): string {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "SL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ProfileMenu() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useGetUserQuery();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

  useClickOutside(containerRef, () => setIsOpen(false));

  const displayName = user?.display_name?.trim() || "Your account";
  const initials = initialsFor(user?.display_name, user?.email);

  const handleLogout = useCallback(async () => {
    try {
      /** Best-effort server-side revoke — the local session is cleared either way. */
      await logoutUser().unwrap();
    } catch {
      // Ignore: an expired or already-revoked token must not block sign-out.
    }
    clearAllAuthCookies();
    dispatch(logoutAction());
    setIsOpen(false);
    router.replace("/login");
    router.refresh();
  }, [dispatch, logoutUser, router]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className={cn(
          "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] transition",
          isOpen ? "ring-2 ring-[#8b5cf6]/60" : "hover:opacity-90"
        )}
      >
        {user?.avatar_url ? (
          <RemoteAvatarImage
            uri={user.avatar_url}
            fallbackUri={AVATAR_FALLBACK}
            alt={displayName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-white">{initials}</span>
        )}
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-[#1e2536] bg-[#0d1117] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="border-b border-[#1e2536] px-4 py-3">
            <p className="truncate text-sm font-medium text-white">
              {displayName}
            </p>
            {user?.email ? (
              <p className="truncate text-xs text-[#6b7280]">{user.email}</p>
            ) : null}
          </div>

          <div className="py-1">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm text-[#c7d0ff] transition hover:bg-[#141a24] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[#1e2536] py-1">
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="block w-full px-4 py-2.5 text-left text-sm text-[#fca5a5] transition hover:bg-[#1d1216] hover:text-[#fecaca] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
