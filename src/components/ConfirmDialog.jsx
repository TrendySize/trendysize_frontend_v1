import { useEffect, useRef } from "react";

// Accessible confirmation dialog used in place of window.confirm().
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    confirmRef.current?.focus();

    const handleKey = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = tone === "danger";

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-desc" : undefined}
        className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(36,16,101,0.25)]"
      >
        <h2
          id="confirm-title"
          className="text-[17px] font-bold text-[#241065]"
        >
          {title}
        </h2>

        {description && (
          <p
            id="confirm-desc"
            className="mt-2 text-[13px] leading-5 text-[#4B5563]"
          >
            {description}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 items-center justify-center rounded-lg border border-[#D8D6FE] bg-white px-4 text-[13px] font-semibold text-[#241065] transition hover:bg-[#F4F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`flex h-10 items-center justify-center rounded-lg px-4 text-[13px] font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isDanger
                ? "bg-[#DC2626] hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]/40"
                : "bg-[#6133DA] hover:bg-[#4D26B5] focus-visible:ring-[#6133DA]/40"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
