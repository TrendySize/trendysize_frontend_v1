import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Database,
  Lock,
  Share2,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const POLICY_SECTIONS = [
  {
    icon: Database,
    title: "1. What we collect",
    points: [
      "Account details you give us: first and last name, email address, phone and WhatsApp number, store handle, and a securely hashed password.",
      "Business information you choose to publish: business name, story, location, specialization, contact details, statistics, profile and cover pictures.",
      "Customer records you create: names, phone numbers and gender, plus the measurement links you generate for them.",
      "Measurement data: front, side and reference photos, height, body measurements, AI estimates, confidence and review status.",
      "Technical information needed to run and protect the service, such as sign-in sessions, device/browser details, IP address and error logs.",
    ],
  },
  {
    icon: UserRound,
    title: "2. Why we use it",
    points: [
      "To create your account, verify your email, sign you in and keep your session secure.",
      "To generate single-use measurement links and let your customers submit their details and photos.",
      "To estimate body measurements from the photos and show the results to you and the relevant customer.",
      "To display your public storefront and the information you choose to share.",
      "To send transactional emails such as confirmation and password-reset links.",
      "To provide support, prevent abuse, troubleshoot failures and improve the reliability of the service.",
    ],
  },
  {
    icon: Lock,
    title: "3. How we keep it confidential",
    points: [
      "Your workspace is private by default. Customers, measurements and drafts are visible only to your account, not to other vendors.",
      "A measurement link is personal and single-use. It expires after 24 hours and can only be used by the customer you sent it to.",
      "Your public storefront shows only the business information you choose to publish.",
      "We do not sell or rent your data, and we do not use it for third-party advertising.",
      "Passwords are stored as one-way hashes, never as readable text. Traffic between your browser and our servers uses HTTPS.",
      "Access by our staff is limited to what is needed to operate, secure and support the service.",
    ],
  },
  {
    icon: Share2,
    title: "4. Who processes it",
    points: [
      "We use trusted service providers for hosting, the database, image storage and email delivery. They process data only on our instructions.",
      "Our infrastructure providers include Supabase (database), Cloudinary (images), Render (hosting), Brevo (email) and an AI measurement service.",
      "Some providers may process data outside Nigeria. Where that happens, we rely on the provider's contractual and security safeguards.",
      "We may disclose data if the law requires it, or to protect the rights, safety and security of TrendySize, our users or the public.",
    ],
  },
  {
    icon: Trash2,
    title: "5. Retention and disposal",
    points: [
      "We keep your account and business data for as long as your account exists and is needed to provide the service.",
      "Measurement links expire after 24 hours. Deleting a customer removes that customer's record and its measurement history from your workspace.",
      "When you ask us to erase your account, we delete your profile, storefront content, portfolio images, customers and measurement records, including the images held by our image provider.",
      "Cached profile data and photos on your device are cleared when you sign out or switch accounts.",
      "Backups and security logs are kept for a limited, rolling period and then overwritten or deleted.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "6. Your rights and choices",
    points: [
      "You can view and correct your business details at any time in Settings.",
      "You can delete customers and featured work from your workspace, or ask us to erase your whole account.",
      "You can withdraw consent by declining this policy. Declining signs you out and prevents you from using TrendySize until you accept.",
      "To request access, a copy, correction or deletion of your data, contact support from the in-app Contact Support page.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "7. Terms of use",
    points: [
      "Use TrendySize only for lawful business purposes and only with customer data you have permission to collect.",
      "Only upload photos of people who have agreed to have their measurements taken and processed.",
      "Keep your login details private. You are responsible for activity carried out with your account.",
      "Do not attempt to access another vendor's workspace, disrupt the service, or misuse the AI measurement feature.",
      "If you do not accept these terms, do not check the box below. You will be signed out and cannot use the app; you can sign in again later and accept.",
    ],
  },
];

export default function DataPolicyModal({ onAccept, onDecline, saving, error }) {
  const [accepted, setAccepted] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      cardRef.current?.focus();
    });

    // The gate deliberately has no close button, so keep keyboard focus inside
    // it rather than letting Tab wander behind the overlay.
    const handleKeyDown = (event) => {
      if (event.key !== "Tab" || !cardRef.current) return;

      const focusable = Array.from(
        cardRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-policy-title"
        aria-describedby="data-policy-summary"
        tabIndex={-1}
        className="flex max-h-[94dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-2xl bg-[var(--tk-bg-elevated)] shadow-2xl outline-none sm:max-h-[90vh] sm:rounded-2xl"
      >
        {/* HEADER */}
        <div className="flex items-start gap-3 border-b border-[var(--tk-border)] px-5 py-4 sm:px-6 sm:py-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-brand)]/10 text-[var(--tk-brand)]">
            <ShieldCheck size={22} />
          </span>

          <div className="min-w-0">
            <h1
              id="data-policy-title"
              className="text-[17px] font-bold leading-tight text-[var(--tk-ink)] sm:text-[19px]"
            >
              Data confidentiality & terms of use
            </h1>
            <p
              id="data-policy-summary"
              className="mt-1 text-[11px] leading-5 text-[var(--tk-ink-muted)] sm:text-[12px]"
            >
              Please read this before using your workspace. Last updated
              22 October 2026 · version 2026-10-22.
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-[12px] leading-6 text-[var(--tk-ink-soft)] sm:text-[13px]">
            TrendySize handles personal and body-measurement data, so we want
            to be direct about what we collect, why, who can see it, and how
            you can have it removed. The points below are part of your
            agreement with us.
          </p>

          <div className="mt-4 space-y-5">
            {POLICY_SECTIONS.map((section) => {
              const Icon = section.icon;

              return (
                <section key={section.title}>
                  <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--tk-ink)] sm:text-[14px]">
                    <Icon
                      size={15}
                      className="shrink-0 text-[var(--tk-brand)]"
                      aria-hidden="true"
                    />
                    {section.title}
                  </h2>

                  <ul className="mt-2 space-y-1.5">
                    {section.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2 text-[11px] leading-5 text-[var(--tk-ink-muted)] sm:text-[12px]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--tk-brand)]"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-5 py-4 sm:px-6">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              disabled={saving}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--tk-border-strong)] accent-[var(--tk-brand)]"
            />
            <span className="text-[11px] font-medium leading-5 text-[var(--tk-ink)] sm:text-[12px]">
              I have read and accept the data confidentiality and terms of use.
              I understand that if I do not accept, I will be signed out and
              cannot use TrendySize until I accept.
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium leading-5 text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onDecline}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 px-4 text-[12px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Decline & sign out
            </button>

            <button
              type="button"
              onClick={onAccept}
              disabled={!accepted || saving}
              aria-busy={saving}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[var(--tk-brand)] px-5 text-[12px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={14} />
                  Accept & continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
