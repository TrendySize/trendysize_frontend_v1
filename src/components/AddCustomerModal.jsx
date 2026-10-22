import { useState } from "react";

import { Plus, X } from "lucide-react";

import Toast from "./Toast";
import { InputField } from "./ProfileFormFields";
import { upsertCustomer } from "../services/api";
import { customerDisplayName, useOverlay } from "../profileShared";

/*
|--------------------------------------------------------------------------
| ADD CUSTOMER MODAL (guide §4.1 — POST /api/customers upsert-by-phone)
|--------------------------------------------------------------------------
|
| The backend upserts on PhoneNumber: posting an existing number returns the
| existing customer (200) instead of a duplicate. We surface that to the
| vendor ("already in your records") rather than silently adding a row.
|
| Gender must be a JSON number (0 = Male, 1 = Female) — no enum converter is
| registered server-side.
|
*/

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  gender: "1", // string in the <select>; converted to number on submit
};

export default function AddCustomerModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [wasOpen, setWasOpen] = useState(false);

  const dialogRef = useOverlay(open, onClose);

  if (open && !wasOpen) {
    setWasOpen(true);
    setForm(EMPTY_FORM);
    setError("");
    setSaving(false);
    setToast(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phoneNumber = form.phoneNumber.trim();

    if (!firstName && !lastName) {
      setError("Enter the customer's name.");
      return;
    }

    if (!phoneNumber) {
      setError("Enter the customer's phone number.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const customer = await upsertCustomer({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phoneNumber,
        gender: Number(form.gender), // 0 = Male, 1 = Female
      });

      setToast({
        message: `${customerDisplayName(customer) || "Customer"} saved.`,
        tone: "success",
      });

      if (onCreated) {
        onCreated(customer);
      }

      // Close shortly after so the success toast is visible.
      window.setTimeout(() => onClose?.(), 600);
    } catch (submitError) {
      console.error("Add customer error:", submitError);
      setSaving(false);
      setError(
        submitError?.message || "Could not save the customer. Please try again."
      );
    }
  };

  return (
    <div
      className="tk-scrim-enter fixed inset-0 z-[1001] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-customer-title"
      onClick={onClose}
    >
      <form
        ref={dialogRef}
        tabIndex={-1}
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="tk-panel-enter flex max-h-[92dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-t-2xl bg-[var(--tk-bg-elevated)] shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--tk-border)] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="add-customer-title"
              className="text-[15px] font-bold text-[var(--tk-ink)]"
            >
              Add customer
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-[var(--tk-ink-muted)]">
              Save a customer once, then generate measurement links for them.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-surface-muted)] text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/50"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="e.g. Chukwuma"
              maxLength={60}
            />

            <InputField
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="e.g. Johnson"
              maxLength={60}
            />

            <div className="sm:col-span-2">
              <InputField
                label="Phone number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. +2348012345678"
                inputMode="tel"
                maxLength={20}
                hint="Used to detect returning customers — adding the same number again reuses the existing record."
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="gender"
                className="mb-1.5 block text-[12px] font-semibold text-[var(--tk-ink)] sm:text-[14px]"
              >
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--tk-border-strong)] px-3 py-2.5 text-[13px] text-[var(--tk-ink)] outline-none transition focus:border-[var(--tk-brand)] focus:ring-2 focus:ring-[var(--tk-brand)]/10 sm:text-[14px]"
              >
                <option value="1">Female</option>
                <option value="0">Male</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2.5 text-[11px] leading-5 text-[#B91C1C]">
              {error}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--tk-border)] px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:pb-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[9px] px-3 py-2 text-[12px] font-semibold text-[var(--tk-ink-muted)] transition hover:bg-[var(--tk-surface)]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 rounded-[9px] bg-[var(--tk-brand)] px-4 py-2 text-[12px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            ) : (
              <Plus size={13} />
            )}
            {saving ? "Saving…" : "Save customer"}
          </button>
        </div>

        <Toast
          message={toast?.message}
          tone={toast?.tone}
          onDismiss={() => setToast(null)}
        />
      </form>
    </div>
  );
}
