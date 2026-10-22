import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  Link2,
  Settings,
  Sparkles,
  Store,
  UsersRound,
  X,
} from "lucide-react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to TrendySize",
    route: "/dashboard",
    intro:
      "This tour shows you where everything lives and how the measurement flow works. It takes about two minutes.",
    points: [
      "Your account starts with 10 free measurement links — no subscription needed to begin.",
      "Each link lets one customer securely submit their measurements and photos.",
      "You can retake this tour any time from Settings or the Help Center.",
    ],
    tip: "Use Next and Back below, or the arrow keys, to move through the tour.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    route: "/dashboard",
    intro:
      "Your home base. It summarises the health of your workspace and gives you the shortcuts you use most.",
    points: [
      "See total customers, measurement activity and recent submissions at a glance.",
      "Your store handle and public profile link are here, ready to copy or share.",
      "Notifications and quick actions take you straight to the next task, such as creating a customer link.",
    ],
    tip: "If an email needs confirming, the dashboard shows a reminder with a resend option.",
  },
  {
    icon: UsersRound,
    title: "Customers",
    route: "/customers",
    intro:
      "Every measurement belongs to a customer record, so this is where most of your work starts.",
    points: [
      "Add a customer yourself, or create a placeholder by entering just a name when you generate a link.",
      "Search by name or phone number, then use the row actions to generate a link, view, edit or delete.",
      "Statuses track each measurement: pending, submitted, needs review or completed.",
    ],
    tip: "Deleting a customer also removes their measurement history from your workspace.",
  },
  {
    icon: Link2,
    title: "Measurement links",
    route: "/customers",
    intro:
      "The link icon next to a customer creates a personal, single-use measurement link.",
    points: [
      "The link expires after 24 hours and works once, so it is safe to send over WhatsApp or another channel.",
      "The customer opens the link, enters their details and height, then uploads front and side photos.",
      "The AI estimates the measurements and the result appears on your dashboard and the customer record automatically.",
      "Each generated link uses one free link until you have an active subscription.",
    ],
    tip: "The generate-link window shows how many free links you have left before you create one.",
  },
  {
    icon: Store,
    title: "Profile & public storefront",
    route: "/profile",
    intro:
      "This is a preview of the page customers see when you share your store link.",
    points: [
      "Your business story, location, specialization, statistics and featured work appear here.",
      "Customers can reach you on WhatsApp directly from the storefront.",
      "Copy the storefront link or share it on WhatsApp, Instagram, TikTok or Facebook from the Dashboard.",
    ],
    tip: "Anything you leave blank is simply hidden from the public page — you choose what to publish.",
  },
  {
    icon: Settings,
    title: "Settings",
    route: "/settings",
    intro:
      "Keep the details behind your storefront accurate. Changes here update the public page.",
    points: [
      "Switch between light and dark mode for this device.",
      "Upload your business picture and cover image, and edit your name, story, location and specialization.",
      "Update WhatsApp and contact details, business statistics and Featured Work images.",
    ],
    tip: "Use the sticky Save Changes bar after editing so your storefront updates everywhere.",
  },
  {
    icon: CreditCard,
    title: "Free links & subscription",
    route: "/subscription",
    intro:
      "Start free, then choose a plan when your 10 complimentary links run out.",
    points: [
      "Every new account receives 10 free measurement links.",
      "When the allowance is used, link generation pauses until you subscribe.",
      "The Subscription page lists the available plans. Payment processing is being added, so plans are shown for planning only for now.",
    ],
    tip: "Your remaining free links are shown every time you generate a link.",
  },
  {
    icon: CircleHelp,
    title: "Help Center & support",
    route: "/help-center",
    intro:
      "Answers and humans, whenever you need them.",
    points: [
      "Browse guides for getting started, managing your business, account and billing, and troubleshooting.",
      "Search the Help Center for a specific topic instead of scrolling.",
      "If something is broken or you need account help, use Contact Support to reach our team.",
    ],
    tip: "That's the tour. You can restart it any time from Settings or the Help Center.",
  },
];

export default function GuidedTour({ onFinish }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const cardRef = useRef(null);

  const step = TOUR_STEPS[index];
  const isLast = index === TOUR_STEPS.length - 1;

  // Move the underlying page as the tour advances so each explanation is
  // shown next to the real screen it describes. Mounting fresh on every tour
  // start means the walkthrough always begins at step one.
  useEffect(() => {
    if (!step) return;
    navigate(step.route);
  }, [index, step, navigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      cardRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Tab" && cardRef.current) {
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
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onFinish();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isLast) onFinish();
        else setIndex((current) => Math.min(current + 1, TOUR_STEPS.length - 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => Math.max(current - 1, 0));
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLast, onFinish]);

  if (!step) return null;

  const Icon = step.icon;
  const progress = ((index + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[1150] flex items-end justify-center bg-[#241065]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className="flex max-h-[92dvh] w-full max-w-[540px] flex-col overflow-hidden rounded-t-2xl bg-[var(--tk-bg-elevated)] shadow-2xl outline-none sm:max-h-[88vh] sm:rounded-2xl"
      >
        {/* PROGRESS */}
        <div className="h-1 w-full bg-[var(--tk-surface-muted)]">
          <div
            className="h-full rounded-r-full bg-[var(--tk-brand)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-5 pt-4 sm:px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--tk-ink-muted)]">
            Step {index + 1} of {TOUR_STEPS.length}
          </span>

          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--tk-ink-muted)] transition hover:bg-[var(--tk-surface)] hover:text-[var(--tk-ink)]"
          >
            Skip tour
            <X size={13} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-brand)]/10 text-[var(--tk-brand)]">
              <Icon size={21} />
            </span>
            <h2
              id="tour-title"
              className="text-[17px] font-bold leading-tight text-[var(--tk-ink)] sm:text-[19px]"
            >
              {step.title}
            </h2>
          </div>

          <p className="mt-3 text-[12px] leading-6 text-[var(--tk-ink-soft)] sm:text-[13px]">
            {step.intro}
          </p>

          <ul className="mt-3 space-y-2">
            {step.points.map((point) => (
              <li
                key={point}
                className="flex gap-2.5 text-[11px] leading-5 text-[var(--tk-ink-muted)] sm:text-[12px]"
              >
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--tk-brand)]"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {step.tip && (
            <div className="mt-4 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[10px] leading-5 text-[var(--tk-ink-muted)] sm:text-[11px]">
              <span className="font-semibold text-[var(--tk-ink)]">Tip:</span>{" "}
              {step.tip}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--tk-border)] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(current - 1, 0))}
            disabled={index === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--tk-border-strong)] px-3 text-[11px] font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={13} />
            Back
          </button>

          <div className="flex items-center gap-1.5" aria-hidden="true">
            {TOUR_STEPS.map((item, dotIndex) => (
              <span
                key={item.title}
                className={`h-1.5 rounded-full transition-all ${
                  dotIndex === index
                    ? "w-4 bg-[var(--tk-brand)]"
                    : "w-1.5 bg-[var(--tk-border-strong)]"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (isLast) onFinish();
              else setIndex((current) => current + 1);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--tk-brand)] px-4 text-[11px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90"
          >
            {isLast ? "Finish tour" : "Next"}
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
