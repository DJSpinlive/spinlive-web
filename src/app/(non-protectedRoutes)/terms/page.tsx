import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of SpinLive, and how we handle your data.",
};

/** Placeholder date — replace when legal sign-off lands. */
const LAST_UPDATED = "19 September 2026";

interface Section {
  id: string;
  heading: string;
  paragraphs: string[];
}

const TERMS_SECTIONS: Section[] = [
  {
    id: "acceptance",
    heading: "1. Accepting these terms",
    paragraphs: [
      "By creating a SpinLive account, or by using the SpinLive website or mobile apps, you agree to these Terms & Conditions. If you do not agree, do not use the service.",
      "You must be at least 18 years old, or the age of majority where you live, to hold a SpinLive account.",
    ],
  },
  {
    id: "accounts",
    heading: "2. Your account",
    paragraphs: [
      "You are responsible for the accuracy of the details on your profile and for keeping your password confidential. Tell us straight away if you believe someone else has used your account.",
      "We may suspend or close an account that breaches these terms, that is used to impersonate someone else, or that puts other people on the platform at risk.",
    ],
  },
  {
    id: "bookings",
    heading: "3. Bookings, streams and tips",
    paragraphs: [
      "A booking is an agreement between you and the DJ. SpinLive provides the platform and processes payment, but is not a party to the performance itself.",
      "Tips and paid features are charged at the point of purchase and are non-refundable except where the law requires otherwise, or where a DJ fails to deliver a booked performance.",
    ],
  },
  {
    id: "conduct",
    heading: "4. Community conduct",
    paragraphs: [
      "Live chat, song requests and reviews are public. Do not post content that is unlawful, hateful, harassing, sexually explicit, or that infringes someone else's rights.",
      "Reviews must reflect a genuine experience. We remove reviews that are fake, paid for, or written to harm a DJ's reputation without cause.",
    ],
  },
  {
    id: "content",
    heading: "5. Content and intellectual property",
    paragraphs: [
      "DJs keep the rights to their sets and recordings. By streaming on SpinLive, a DJ grants us a licence to transmit and store that content for the purpose of running the service.",
      "SpinLive branding, software and designs belong to SpinLive and may not be copied or reused without written permission.",
    ],
  },
  {
    id: "liability",
    heading: "6. Service availability and liability",
    paragraphs: [
      "We work to keep SpinLive available, but we do not guarantee uninterrupted streaming. Outages, network conditions and third-party services can affect a live show.",
      "To the extent permitted by law, SpinLive is not liable for indirect or consequential losses arising from your use of the service.",
    ],
  },
  {
    id: "changes",
    heading: "7. Changes to these terms",
    paragraphs: [
      "We may update these terms as the product changes. When we make a material change we will notify you in the app or by email before it takes effect.",
    ],
  },
];

const PRIVACY_SECTIONS: Section[] = [
  {
    id: "privacy",
    heading: "8. Privacy Policy — what we collect",
    paragraphs: [
      "We collect the details you give us (name, email address, profile photo, bio, location and genre preferences), the activity you generate on the platform (bookings, follows, reviews, chat messages, tips), and technical data such as device type and IP address.",
      "Payment card details are handled by our payment processor. SpinLive does not store full card numbers.",
    ],
  },
  {
    id: "privacy-use",
    heading: "9. How we use your data",
    paragraphs: [
      "We use your data to run your account, match you with DJs whose genres fit your preferences, process payments, send service notifications, and keep the platform safe.",
      "We do not sell your personal data. We share it only with the processors that run the service on our behalf, or where the law requires it.",
    ],
  },
  {
    id: "privacy-rights",
    heading: "10. Your rights",
    paragraphs: [
      "You can access, correct, export or delete your personal data from your profile settings, or by contacting support. Deleting your account removes your profile and preferences; some transaction records are kept where we are required to keep them.",
    ],
  },
];

function LegalSection({ section }: { section: Section }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 border-t border-[#12213c] pt-8"
    >
      <h2 className="text-lg font-semibold text-white">{section.heading}</h2>
      {section.paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="mt-3 text-sm leading-relaxed text-[#9aa5bc]"
        >
          {paragraph}
        </p>
      ))}
    </section>
  );
}

export default function TermsPage() {
  const sections = [...TERMS_SECTIONS, ...PRIVACY_SECTIONS];

  return (
    <main className="min-h-screen overflow-y-auto bg-[#030a17] px-4 py-8 text-white sm:px-6 md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/login" className="inline-flex">
          <Logo />
        </Link>

        <h1 className="mt-8 text-3xl font-semibold leading-tight text-white">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-[#6e7893]">
          Last updated {LAST_UPDATED}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#9aa5bc]">
          These terms cover how you use SpinLive, what you can expect from us,
          and how we handle your data. The Privacy Policy starts at section 8.
        </p>

        <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-[#1e2a46] bg-[#050f1f] px-3 py-1.5 text-xs text-[#bac7de] transition hover:border-[#2e4d88] hover:text-white"
            >
              {section.heading}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <LegalSection key={section.id} section={section} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#12213c] bg-[#050f1f] p-6">
          <h2 className="text-base font-semibold text-white">Questions?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#9aa5bc]">
            Email{" "}
            <a
              href="mailto:support@spinlivepro.com"
              className="font-medium text-[#7d66ff] underline-offset-2 hover:underline"
            >
              support@spinlivepro.com
            </a>{" "}
            and we will get back to you.
          </p>
        </div>

        <div className="mt-8 flex gap-4 text-sm">
          <Link
            href="/signup"
            className="font-medium text-[#7d66ff] transition hover:text-[#9a86ff]"
          >
            Back to sign up
          </Link>
          <Link
            href="/login"
            className="font-medium text-[#7d66ff] transition hover:text-[#9a86ff]"
          >
            Back to log in
          </Link>
        </div>
      </div>
    </main>
  );
}
