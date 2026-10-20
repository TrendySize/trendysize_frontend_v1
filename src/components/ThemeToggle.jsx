import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { useTheme } from "../context/themeStore";

/**
 * A quiet segmented light/dark switch.
 * `variant="compact"` renders a single icon button (used in app chrome);
 * the default renders an accessible two-option toggle.
 */
export default function ThemeToggle({ variant = "default", className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={isDark}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-[var(--tk-icon)] transition-colors hover:bg-[var(--tk-hover)] hover:text-[var(--tk-icon-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/50 ${className}`}
      >
        {isDark ? (
          <HiOutlineSun size={20} aria-hidden="true" />
        ) : (
          <HiOutlineMoon size={20} aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={toggleTheme}
      className={`group relative inline-flex h-8 w-[62px] shrink-0 items-center rounded-full border border-[var(--tk-border)] bg-[var(--tk-toggle-track)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tk-bg)] ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--tk-toggle-thumb)] text-[var(--tk-toggle-thumb-ink)] shadow-sm transition-transform duration-300 ease-out ${
          isDark ? "translate-x-[calc(62px-2rem)]" : "translate-x-0"
        }`}
      >
        {isDark ? <HiOutlineMoon size={14} /> : <HiOutlineSun size={14} />}
      </span>

      <span className="pointer-events-none flex w-full items-center justify-between px-[9px] text-[var(--tk-icon)]">
        <HiOutlineSun size={13} aria-hidden="true" />
        <HiOutlineMoon size={13} aria-hidden="true" />
      </span>
    </button>
  );
}
