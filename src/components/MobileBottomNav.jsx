import { useEffect, useRef, useState } from "react";

import {
  CircleHelp,
  Headphones,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Settings,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ThemeToggle from "./ThemeToggle";
import { logout as apiLogout, clearToken } from "../services/api";

const primaryTabs = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", path: "/customers", icon: UsersRound },
  { label: "Profile", path: "/profile", icon: UserRound },
];

const moreItems = [
  { label: "Help Center", path: "/help-center", icon: CircleHelp },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Contact Support", path: "/contact-support", icon: Headphones },
];

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function MobileBottomNav({ activeLabel = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef(null);

  const isActive = (label, path) =>
    activeLabel === label || location.pathname === path;

  const moreActive = moreItems.some((item) => isActive(item.label, item.path));

  const handleLogout = () => {
    setMoreOpen(false);
    apiLogout()
      .catch(() => {})
      .finally(() => {
        clearToken();
        localStorage.removeItem("trendySize_user");
        localStorage.removeItem("user");
        navigate("/signin");
      });
  };

  useEffect(() => {
    if (!moreOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) return;

      const focusable = Array.from(
        sheetRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
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

    const frame = window.requestAnimationFrame(() => {
      sheetRef.current?.querySelector(FOCUSABLE_SELECTOR)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [moreOpen]);

  const tabClass = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium leading-none transition-colors duration-[var(--tk-dur-base)] ease-[var(--tk-ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tk-brand)] ${
      active ? "text-[var(--tk-brand)]" : "text-[var(--tk-ink-muted)] hover:text-[var(--tk-ink-soft)]"
    }`;

  return (
    <>
      {/* MORE SHEET */}
      {moreOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="More options"
            className="tk-glass tk-glass-line relative z-10 rounded-t-2xl border-t border-[var(--tk-glass-border)] pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-[13px] font-bold text-[var(--tk-ink)]">
                More
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--tk-ink-muted)] transition hover:bg-[var(--tk-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col px-2 py-1" aria-label="More">
              {moreItems.map(({ label, path, icon: Icon }) => (
                <Link
                  key={label}
                  to={path}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className="text-[var(--tk-brand)]"
                  />
                  {label}
                </Link>
              ))}

              <div className="flex items-center justify-between rounded-xl px-3 py-2.5">
                <span className="text-[14px] font-medium text-[var(--tk-ink)]">
                  Appearance
                </span>
                <ThemeToggle />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium text-[#EF4444] transition hover:bg-[#EF4444]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]/50"
              >
                <LogOut size={18} strokeWidth={1.6} aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav
        aria-label="Primary"
        className="tk-glass tk-glass-line fixed inset-x-0 bottom-0 z-[990] flex border-t border-[var(--tk-glass-border)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {primaryTabs.map(({ label, path, icon: Icon }) => {
          const active = isActive(label, path);
          return (
            <Link
              key={label}
              to={path}
              aria-current={active ? "page" : undefined}
              className={tabClass(active)}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.1 : 1.6}
                aria-hidden="true"
                className={`transition-transform duration-[var(--tk-dur-base)] ease-[var(--tk-ease-out)] ${
                  active ? "motion-safe:-translate-y-0.5" : ""
                }`}
              />
              <span className="max-[360px]:text-[9px]">
                {label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(true)}
          className={tabClass(moreActive)}
        >
          <MoreHorizontal size={22} strokeWidth={1.8} aria-hidden="true" />
          <span className="max-[360px]:text-[9px]">More</span>
        </button>
      </nav>
    </>
  );
}
