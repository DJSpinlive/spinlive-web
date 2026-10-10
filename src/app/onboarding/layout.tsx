import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Get started",
};

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="min-h-screen bg-[#030a17] text-white">{children}</div>;
}
