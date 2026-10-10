import { cn } from "@/lib/utils";

interface LogoProps {
  /** Hide the "SpinLive" wordmark and render the mark only. */
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}

/**
 * Single source of truth for the SpinLive logo.
 * Swap the SVG here and every surface (navbar, auth, onboarding, legal) follows.
 */
export function Logo({
  markOnly = false,
  className,
  markClassName,
  wordmarkClassName,
}: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        role="img"
        aria-label="SpinLive"
        className={cn("h-8 w-8 shrink-0", markClassName)}
      >
        <defs>
          <linearGradient id="spinlive-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#spinlive-mark)" />
        <circle
          cx="16"
          cy="16"
          r="8.5"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
        <circle cx="16" cy="16" r="3.25" fill="#ffffff" />
        <circle cx="16" cy="16" r="1.1" fill="#6366f1" />
      </svg>
      {markOnly ? null : (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight text-white",
            wordmarkClassName
          )}
        >
          SpinLive
        </span>
      )}
    </span>
  );
}
