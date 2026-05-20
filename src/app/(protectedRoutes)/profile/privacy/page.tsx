"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
} from "lucide-react";

import { ToggleSettingRow } from "@/components/ui/toggle";

import {
  loadPrivacyPrefs,
  savePrivacyPrefs,
  type PrivacyPrefs,
} from "@/utilities/privacy-preferences-storage";

const APP_VERSION_DISPLAY = `v${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"} (Web)`;

function ListRow({
  title,
  onPress,
  withDivider,
}: {
  title: string;
  onPress: () => void;
  withDivider?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`flex min-h-[58px] w-full items-center justify-between gap-3 py-3 text-left ${
        withDivider ? "border-t border-[#1e2536]" : ""
      }`}
    >
      <span className="font-bold text-[#f5f7ff]">{title}</span>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-[#7d89ad]" />
    </button>
  );
}

function ExternalRow({
  title,
  onPress,
  withDivider,
}: {
  title: string;
  onPress: () => void;
  withDivider?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`flex min-h-[58px] w-full items-center justify-between gap-3 py-3 text-left ${
        withDivider ? "border-t border-[#1e2536]" : ""
      }`}
    >
      <span className="font-bold text-[#f5f7ff]">{title}</span>
      <ExternalLink className="h-4 w-4 shrink-0 text-[#a9b2d9]" />
    </button>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#1e2536] bg-[#0d1117] px-3.5">
      {children}
    </div>
  );
}

export default function PrivacySupportPage() {
  const [toggles, setToggles] = useState<PrivacyPrefs>(() => ({
    ...loadPrivacyPrefs(),
  }));
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    savePrivacyPrefs(toggles);
  }, [toggles]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const setToggle = (key: keyof PrivacyPrefs, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto w-full max-w-lg pb-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1e2536] bg-[#0d1117] transition hover:border-[#2d3548]"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Privacy &amp; support</h1>
      </div>

      {toast ? (
        <p
          className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <div className="space-y-6">
        <section>
          <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#7f8aa8]">
            Privacy controls
          </p>
          <SectionCard>
            <ToggleSettingRow
              title="Private profile"
              subtitle="Only approved users can see your past streams and gigs."
              checked={toggles.privateProfile}
              onCheckedChange={(v) => setToggle("privateProfile", v)}
            />
            <ToggleSettingRow
              title="Activity status"
              subtitle="Show when you are active on the platform."
              checked={toggles.activityStatus}
              onCheckedChange={(v) => setToggle("activityStatus", v)}
              withDivider
            />
            <ToggleSettingRow
              title="Allow direct messages"
              subtitle="Let people you don't follow send message requests."
              checked={toggles.allowDm}
              onCheckedChange={(v) => setToggle("allowDm", v)}
              withDivider
            />
            <ListRow
              title="Blocked accounts"
              onPress={() =>
                showToast(
                  "Blocked user management isn't available on web yet."
                )
              }
              withDivider
            />
          </SectionCard>
        </section>

        <section>
          <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#7f8aa8]">
            Support &amp; help
          </p>
          <SectionCard>
            <ListRow
              title="Help center & FAQs"
              onPress={() =>
                showToast("Help center isn't available on web yet.")
              }
              withDivider
            />
            <ListRow
              title="Contact support"
              onPress={() =>
                showToast(
                  "Support contact options aren't available on web yet."
                )
              }
              withDivider
            />
            <ListRow
              title="Report a problem"
              onPress={() =>
                showToast("Reporting isn't wired up on web yet.")
              }
            />
          </SectionCard>
        </section>

        <section>
          <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#7f8aa8]">
            About
          </p>
          <SectionCard>
            <ExternalRow
              title="Terms of Service"
              onPress={() =>
                showToast(
                  "Terms page will be linked here once it's published."
                )
              }
              withDivider
            />
            <ExternalRow
              title="Privacy Policy"
              onPress={() =>
                showToast(
                  "Privacy policy will be linked here once it's published."
                )
              }
              withDivider
            />
            <div className="py-3">
              <p className="font-bold text-[#f5f7ff]">App version</p>
              <p className="mt-1.5 text-sm text-[#8e97c4]">
                {APP_VERSION_DISPLAY}
              </p>
            </div>
          </SectionCard>
        </section>

        <section>
          <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#7f8aa8]">
            Account action
          </p>
          <button
            type="button"
            className="flex min-h-[54px] w-full items-center gap-2.5 rounded-2xl border border-[#1e2536] bg-[#0d1117] px-3.5 transition hover:border-[#3f2430] hover:bg-[#140a10]"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm(
                  "Are you sure you want to delete your account? This action cannot be undone in the prototype."
                )
              ) {
                showToast(
                  "Account deletion will be added when the backend flow is ready."
                );
              }
            }}
          >
            <Trash2 className="h-[18px] w-[18px] shrink-0 text-[#f87171]" />
            <span className="font-bold text-[#f87171]">Delete account</span>
          </button>
        </section>
      </div>
    </div>
  );
}
