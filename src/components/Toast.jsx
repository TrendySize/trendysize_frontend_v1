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
      className="fixed bottom-5 left-1/2 z-[1000] flex w-[min(92vw,380px)] -translate-x-1/2 items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-[0_12px_40px_rgba(36,16,101,0.18)]"
      style={{ borderColor: isError ? "#FECACA" : "#D8D6FE" }}
    >
      <Icon
        size={18}
        aria-hidden="true"
        className={`mt-0.5 shrink-0 ${
          isError ? "text-[#B91C1C]" : "text-[#16A34A]"
        }`}
      />
      <p className="flex-1 text-[13px] font-medium leading-5 text-[#241065]">
        {message}
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-md text-[#6B7280] transition hover:text-[#241065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
