/** Per-user onboarding completion flag; the API has no field for it yet. */

const STORAGE_KEY = "spinlive_web_onboarded_v1";

function readAll(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function hasCompletedOnboarding(userId: string | undefined): boolean {
  if (!userId) return false;
  return readAll()[userId] === true;
}

export function markOnboardingComplete(userId: string | undefined): void {
  if (!userId || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readAll(), [userId]: true })
    );
  } catch {
    /* ignore quota / privacy mode */
  }
}
