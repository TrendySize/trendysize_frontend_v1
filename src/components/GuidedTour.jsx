import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
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

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to TrendySize",
    route: "/dashboard",
    targets: ['[data-tour="dashboard-overview"]'],
    intro:
      "This tour shows you where everything lives and how the measurement flow works.",
    points: [
      "Start with 10 free measurement links.",
      "Customers submit measurements and photos securely.",
      "You can retake this tour any time from Settings or the Help Center.",
    ],
    tip: "Use Next and Back, or your keyboard arrow keys, to move through the tour.",
  },
  {
    icon: LayoutDashboard,
    title: "Your dashboard",
    route: "/dashboard",
    targets: ['[data-tour="dashboard-activity"]'],
    intro:
      "Your home base for the health of your workspace and the tasks you use most.",
    points: [
      "See customer and measurement activity at a glance.",
      "Find your store handle and public profile link.",
      "Jump straight to common tasks with quick actions.",
    ],
    tip: "Your workspace summary updates as customers submit measurements.",
  },
  {
    icon: UsersRound,
    title: "Customer records",
    route: "/customers",
    targets: ['[data-tour="customers-list"]'],
    intro:
      "Every measurement belongs to a customer record, so this is where most of your work starts.",
    points: [
      "Add customers or create one while generating a link.",
      "Search and sort records by name, phone number or activity.",
      "Review measurement status and history from a customer record.",
    ],
    tip: "Customer records are private to your workspace.",
  },
  {
    icon: Link2,
    title: "Measurement links",
    route: "/customers",
    targets: [
      '[data-tour="measurement-link-action"]',
      '[data-tour="add-customer"]',
      '[data-tour="customers-list"]',
    ],
    intro:
      "Create a personal, single-use measurement link for a customer.",
    points: [
      "Use the Link action beside a customer record.",
      "Share the link over WhatsApp or another channel.",
      "Customers submit their details, height and photos through the link.",
    ],
    tip: "Links expire after 24 hours and use one free link from your allowance.",
  },
  {
    icon: Store,
    title: "Your public storefront",
    route: "/profile",
    targets: ['[data-tour="profile-storefront"]'],
    intro:
      "Show customers what your business makes and how they can reach you.",
    points: [
      "Your story, location, specialization and featured work appear here.",
      "Customers can contact you directly from your storefront.",
      "Share your storefront from the Dashboard.",
    ],
    tip: "You control which business details and images appear publicly.",
  },
  {
    icon: Settings,
    title: "Make it yours",
    route: "/settings",
    targets: ['[data-tour="settings-workspace"]'],
    intro:
      "Settings is where you keep your storefront details and workspace preferences current.",
    points: [
      "Choose light or dark appearance.",
      "Update business images, contact information and your story.",
      "Manage featured work and business statistics.",
    ],
    tip: "Save your changes to update your public profile.",
  },
  {
    icon: CreditCard,
    title: "Free links and plans",
    route: "/subscription",
    targets: ['[data-tour="subscription-plans"]'],
    intro:
      "Start with your complimentary link allowance, then review plans when you need more.",
    points: [
      "Every new account starts with 10 free measurement links.",
      "Link generation pauses when the free allowance runs out.",
      "Available plans are listed on the Subscription page.",
    ],
    tip: "Payments are not yet enabled; plans are currently shown for reference.",
  },
  {
    icon: CircleHelp,
    title: "Help whenever you need it",
    route: "/help-center",
    targets: ['[data-tour="help-search"]'],
    intro:
      "Find answers in the Help Center or reach out when you need a hand.",
    points: [
      "Browse guides for getting started, business management and billing.",
      "Search for a specific topic instead of scrolling.",
      "Contact Support for account or product help.",
    ],
    tip: "You can restart this tour from the Help Center or Settings.",
  },
];

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const SPOTLIGHT_PADDING = 8;
const VIEWPORT_GUTTER = 12;
const PANEL_GAP = 16;

function getBox(element) {
  const rect = element.getBoundingClientRect();
  const left = Math.max(0, rect.left - SPOTLIGHT_PADDING);
  const top = Math.max(0, rect.top - SPOTLIGHT_PADDING);
  const right = Math.min(window.innerWidth, rect.right + SPOTLIGHT_PADDING);
  const bottom = Math.min(window.innerHeight, rect.bottom + SPOTLIGHT_PADDING);

  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
    right,
    bottom,
  };
}

function getCardPosition(target, panel) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const minLeft = VIEWPORT_GUTTER;
  const maxLeft = Math.max(minLeft, viewportWidth - panel.width - VIEWPORT_GUTTER);
  const minTop = VIEWPORT_GUTTER;
  const maxTop = Math.max(minTop, viewportHeight - panel.height - VIEWPORT_GUTTER);
  const centerTop = target.top + target.height / 2 - panel.height / 2;
  const centerLeft = target.left + target.width / 2 - panel.width / 2;
  const candidates = [
    { left: target.right + PANEL_GAP, top: centerTop },
    { left: target.left - panel.width - PANEL_GAP, top: centerTop },
    { left: centerLeft, top: target.bottom + PANEL_GAP },
    { left: centerLeft, top: target.top - panel.height - PANEL_GAP },
  ];

  const fits = candidates.find(
    ({ left, top }) =>
      left >= minLeft &&
      top >= minTop &&
      left + panel.width <= viewportWidth - VIEWPORT_GUTTER &&
      top + panel.height <= viewportHeight - VIEWPORT_GUTTER
  );

  const position =
    fits ||
    (viewportHeight - target.bottom > target.top
      ? { left: centerLeft, top: target.bottom + PANEL_GAP }
      : { left: centerLeft, top: target.top - panel.height - PANEL_GAP });

  return {
    left: Math.min(maxLeft, Math.max(minLeft, position.left)),
    top: Math.min(maxTop, Math.max(minTop, position.top)),
  };
}

export default function GuidedTour({ onFinish }) {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [spotlight, setSpotlight] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ left: 12, top: 12 });
  const cardRef = useRef(null);
  const targetRef = useRef(null);

  const step = TOUR_STEPS[index];
  const Icon = step.icon;
  const isLast = index === TOUR_STEPS.length - 1;
  const progress = ((index + 1) / TOUR_STEPS.length) * 100;
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.2, 0.75, 0.25, 1] };

  useEffect(() => {
    if (location.pathname !== step.route) navigate(step.route);
  }, [index, location.pathname, navigate, step.route]);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const startedAt = Date.now();
    targetRef.current = null;

    const findTarget = () => {
      if (cancelled) return;

      if (location.pathname === step.route) {
        const target = step.targets
          .map((selector) => document.querySelector(selector))
          .find((element) => element && element.getClientRects().length);

        if (target) {
          targetRef.current = target;
          const rect = target.getBoundingClientRect();
          if (rect.top < VIEWPORT_GUTTER || rect.bottom > window.innerHeight - VIEWPORT_GUTTER) {
            target.scrollIntoView({
              behavior: shouldReduceMotion ? "auto" : "smooth",
              block: "center",
              inline: "nearest",
            });
          }
          setSpotlight(getBox(target));
          return;
        }
      }

      if (Date.now() - startedAt > 2500) {
        console.warn(`Guided tour target not found for step: ${step.title}`);
        const width = Math.min(window.innerWidth * 0.72, 520);
        const height = Math.min(window.innerHeight * 0.28, 220);
        setSpotlight({
          left: (window.innerWidth - width) / 2,
          top: Math.max(VIEWPORT_GUTTER, window.innerHeight * 0.16),
          width,
          height,
          right: (window.innerWidth + width) / 2,
          bottom: Math.max(VIEWPORT_GUTTER, window.innerHeight * 0.16) + height,
        });
        return;
      }

      frame = window.requestAnimationFrame(findTarget);
    };

    frame = window.requestAnimationFrame(() => {
      setSpotlight(null);
      findTarget();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [index, location.pathname, shouldReduceMotion, step]);

  useEffect(() => {
    const updateSpotlight = () => {
      if (targetRef.current && document.contains(targetRef.current)) {
        setSpotlight(getBox(targetRef.current));
      }
    };

    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    const observer =
      targetRef.current && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateSpotlight)
        : null;
    if (observer && targetRef.current) observer.observe(targetRef.current);

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
      observer?.disconnect();
    };
  }, [index]);

  useLayoutEffect(() => {
    if (!spotlight || !cardRef.current) return;
    const panel = cardRef.current.getBoundingClientRect();
    setPanelPosition(getCardPosition(spotlight, panel));
  }, [spotlight, index]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const frame = window.requestAnimationFrame(() => {
      cardRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Tab" && cardRef.current) {
        const focusable = Array.from(
          cardRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === cardRef.current)
        ) {
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, isLast, onFinish]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1150] overflow-hidden">
      {spotlight && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-xl border-2 border-violet-400 shadow-[0_0_0_9999px_rgba(17,24,39,0.5)]"
          initial={false}
          animate={{
            left: spotlight.left,
            top: spotlight.top,
            width: spotlight.width,
            height: spotlight.height,
          }}
          transition={transition}
        />
      )}

      <motion.section
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className="pointer-events-auto fixed flex max-h-[min(72dvh,560px)] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] text-[var(--tk-ink)] shadow-xl outline-none"
        initial={
          shouldReduceMotion
            ? false
            : { left: 12, top: 12, opacity: 0, scale: 0.97, y: 8 }
        }
        animate={{
          left: panelPosition.left,
          top: panelPosition.top,
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 5 }}
        transition={transition}
      >
        <div className="h-1 w-full shrink-0 bg-[var(--tk-surface-muted)]">
          <motion.div
            className="h-full rounded-r-full bg-[var(--tk-brand)]"
            animate={{ width: `${progress}%` }}
            transition={transition}
          />
        </div>

        <div className="flex items-center justify-between px-4 pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--tk-ink-muted)]">
            Step {index + 1} of {TOUR_STEPS.length}
          </span>
          <button
            type="button"
            onClick={onFinish}
            aria-label="Close guided tour"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--tk-ink-muted)] transition hover:bg-[var(--tk-surface)] hover:text-[var(--tk-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-brand)]/10 text-[var(--tk-brand)]">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h2 id="tour-title" className="text-[16px] font-bold leading-tight">
              {step.title}
            </h2>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-[var(--tk-ink-soft)]">
            {step.intro}
          </p>
          <ul className="mt-3 space-y-2">
            {step.points.map((point) => (
              <li
                key={point}
                className="flex gap-2.5 text-[11px] leading-5 text-[var(--tk-ink-muted)]"
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
            <div className="mt-3 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2 text-[10px] leading-4 text-[var(--tk-ink-muted)]">
              <span className="font-semibold text-[var(--tk-ink)]">Tip:</span>{" "}
              {step.tip}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--tk-border)] px-4 py-3">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(current - 1, 0))}
            disabled={index === 0}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--tk-border-strong)] px-3 text-[11px] font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <div
            className="flex items-center gap-1.5"
            aria-hidden="true"
          >
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
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[var(--tk-brand)] px-4 text-[11px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)] focus-visible:ring-offset-2"
          >
            {isLast ? "Finish tour" : "Next"}
            {isLast ? <X size={13} /> : <ArrowRight size={13} />}
          </button>
        </div>
      </motion.section>
    </div>
  );
}
