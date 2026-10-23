import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

// Small, accessible, non-blocking feedback toast.
// `message` is required to show it; `tone` is "success" | "error".
export default function Toast({ message, tone = "success", onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!message || !onDismiss) return undefined;

    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, onDismiss, duration]);

  if (!message) return null;

  const isError = tone === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className="tk-toast-enter pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[1002] flex justify-center px-4 lg:bottom-5"
    >
      <div
        className="pointer-events-auto flex w-[min(92vw,380px)] items-start gap-3 rounded-xl border bg-[var(--tk-bg-elevated)] px-4 py-3 "
        style={{ borderColor: isError ? "#FCA5A5" : "var(--tk-border-strong)" }}
      >
        <Icon
          size={18}
          aria-hidden="true"
          className={`mt-0.5 shrink-0 ${
            isError ? "text-[#B91C1C]" : "text-[#16A34A]"
          }`}
        />
        <p className="flex-1 text-sm font-semibold leading-5 text-[var(--tk-ink)]">
          {message}
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-md text-[var(--tk-ink-muted)] transition hover:text-[var(--tk-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
