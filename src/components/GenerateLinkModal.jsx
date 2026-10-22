import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Copy,
  Link2,
  Search,
  Share2,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import Toast from "./Toast";
import {
  generateMeasurementLink,
  generateMeasurementLinkForNewCustomer,
  getCustomers,
  getSubscription,
} from "../services/api";
import {
  MEASUREMENT_LINK_KEY,
  customerDisplayName,
  customerDisplayPhone,
  useOverlay,
} from "../profileShared";

/*
|--------------------------------------------------------------------------
| GENERATE LINK MODAL (guide §5)
|--------------------------------------------------------------------------
|
| One shared flow for creating a per-customer, single-use measurement link.
| Used from the Dashboard ("Create customer link"), the Customers list (row
| action) and CustomerDetails (header action).
|
|  - When `customer` is provided, the picker is skipped (locked selection).
|  - Otherwise a searchable customer picker is shown first.
|  - The generated link is built from the token so it never points at
|    localhost (the backend `link` falls back to localhost when
|    App:FrontendBaseUrl is unset — guide §5).
|
*/

const EMPTY_STATE = {
  mode: "existing", // "existing" (pick a customer) | "new" (create via link)
  selected: null,
  searchTerm: "",
  newCustomer: { firstName: "", lastName: "", phoneNumber: "" },
  orderReference: "",
  result: null,
  error: "",
  loading: false,
  subscription: null, // null = unchecked, { isActive, status } once loaded
  checkingSubscription: false,
};

export default function GenerateLinkModal({
  open,
  onClose,
  customer = null,
  customers = null,
}) {
  const [list, setList] = useState(customers || []);
  const [listLoading, setListLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // All modal-local state in one object so it can be reset in a single,
  // render-phase-friendly update when the modal opens.
  const [state, setState] = useState(EMPTY_STATE);
  const [wasOpen, setWasOpen] = useState(false);

  const dialogRef = useOverlay(open, onClose);

  // Reset every time the modal transitions to open (React "adjust state
  // during render" pattern — avoids setState inside an effect).
  if (open && !wasOpen) {
    setWasOpen(true);
    setState({ ...EMPTY_STATE, selected: customer || null });
    setToast(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  // Lazily load customers for the picker when none were supplied.
  useEffect(() => {
    if (!open || customer || customers) return undefined;

    let cancelled = false;

    getCustomers()
      .then((data) => {
        if (cancelled) return;
        setList(Array.isArray(data) ? data : []);
        setListLoading(false);
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error("Could not load customers for picker:", loadError);
        setListLoading(false);
        setToast({
          message: "Could not load your customers. Please try again.",
          tone: "error",
        });
      });

    setListLoading(true);

    return () => {
      cancelled = true;
    };
  }, [open, customer, customers]);

  // Pre-check the vendor's subscription so we can block link generation before
  // the round trip. The backend still enforces this and returns 400 — we mirror
  // the same copy. If the subscription endpoint is unavailable we fail open and
  // let the generate call surface any error.
  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    setState((previous) => ({ ...previous, checkingSubscription: true }));

    getSubscription()
      .then((data) => {
        if (cancelled) return;
        setState((previous) => ({
          ...previous,
          checkingSubscription: false,
          subscription: data || null,
        }));
      })
      .catch((checkError) => {
        if (cancelled) return;
        console.error("Could not check subscription:", checkError);
        setState((previous) => ({
          ...previous,
          checkingSubscription: false,
          subscription: null,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredCustomers = useMemo(() => {
    const query = state.searchTerm.trim().toLowerCase();
    if (!query) return list;

    return list.filter((item) =>
      [customerDisplayName(item), customerDisplayPhone(item)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [list, state.searchTerm]);

  if (!open) return null;

  const { mode, selected, searchTerm, newCustomer, orderReference, result, error, loading } =
    state;

  // canGenerateLinks is computed by the backend from the paid subscription OR the
  // remaining one-time free links, so the modal mirrors the server exactly.
  const subscriptionBlocked =
    state.subscription != null && state.subscription.canGenerateLinks === false;

  const freeLinksRemaining = state.subscription?.freeLinksRemaining ?? 0;
  const onFreeTrial =
    state.subscription != null &&
    state.subscription.canGenerateLinks === true &&
    state.subscription.isActive === false;

  const subscriptionMessage =
    state.subscription?.status === "expired" && freeLinksRemaining <= 0
      ? "Your subscription has expired. Please renew to generate measurement links."
      : "You've used all 10 free measurement links. Subscribe to keep generating measurement links.";

  // In "new" mode the vendor only needs a name; the customer completes the rest
  // on the public form.
  const hasNewCustomerName =
    Boolean(newCustomer.firstName.trim()) || Boolean(newCustomer.lastName.trim());

  const canSubmit = mode === "new" ? hasNewCustomerName : Boolean(selected?.id);

  const submit = async () => {
    if (loading || subscriptionBlocked || !canSubmit) return;

    setState((previous) => ({ ...previous, loading: true, error: "", result: null }));

    try {
      const data =
        mode === "new"
          ? await generateMeasurementLinkForNewCustomer({
              firstName: newCustomer.firstName.trim() || undefined,
              lastName: newCustomer.lastName.trim() || undefined,
              phoneNumber: newCustomer.phoneNumber.trim() || undefined,
              orderReference: orderReference.trim() || undefined,
            })
          : await generateMeasurementLink(
              selected.id,
              orderReference.trim() || undefined
            );

      const token = data?.token || "";
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const usableLink = token
        ? `${origin}/measure?token=${token}`
        : data?.link || "";

      const generated = {
        token,
        link: usableLink,
        rawLink: data?.link || "",
        customerId: selected?.id ?? null,
        customerName:
          mode === "new"
            ? [newCustomer.firstName.trim(), newCustomer.lastName.trim()]
                .filter(Boolean)
                .join(" ")
            : customerDisplayName(selected),
        orderReference: orderReference.trim() || "",
        createdAt: Date.now(),
        used: false,
      };

      // Remember the newest link so Profile/Dashboard can surface it quickly.
      try {
        localStorage.setItem(MEASUREMENT_LINK_KEY, JSON.stringify(generated));
      } catch (storageError) {
        console.error("Could not cache measurement link:", storageError);
      }

      setState((previous) => ({ ...previous, loading: false, result: generated }));
    } catch (submitError) {
      console.error("Generate link error:", submitError);
      setState((previous) => ({
        ...previous,
        loading: false,
        error: submitError?.message || "Unable to generate a measurement link.",
      }));
    }
  };

  const copyLink = async () => {
    if (!result?.link) return;

    try {
      await navigator.clipboard.writeText(result.link);
      setToast({ message: "Link copied to clipboard.", tone: "success" });
    } catch (copyError) {
      console.error("Copy generated link error:", copyError);
      setToast({
        message: "Couldn't copy the link. Please copy it manually.",
        tone: "error",
      });
    }
  };

  const shareOnWhatsApp = () => {
    if (!result?.link) return;

    const text = encodeURIComponent(
      `Hi ${result.customerName}, please use this link to submit your measurements: ${result.link}`
    );

    const opened = window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );

    if (!opened) {
      setToast({
        message: "Your browser blocked the pop-up. Please allow pop-ups and try again.",
        tone: "error",
      });
    }
  };

  const shareMore = async () => {
    if (!result?.link) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Your TrendySize measurement link",
          text: `Hi ${result.customerName}, please use this link to submit your measurements.`,
          url: result.link,
        });
      } else {
        await copyLink();
      }
    } catch (shareError) {
      if (shareError?.name !== "AbortError") {
        console.error("Share generated link error:", shareError);
        setToast({ message: "Couldn't share the link. Please try again.", tone: "error" });
      }
    }
  };

  const showPicker =
    !customer && !selected && !result && !subscriptionBlocked && mode === "existing";

  const showNewCustomerForm =
    !customer && !selected && !result && !subscriptionBlocked && mode === "new";

  const showModeToggle =
    !customer && !selected && !result && !subscriptionBlocked;

  return (
    <div
      className="tk-scrim-enter fixed inset-0 z-[1001] flex items-end justify-center bg-[#241065]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-link-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="tk-panel-enter flex max-h-[92dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-t-2xl bg-[var(--tk-bg-elevated)] shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--tk-border)] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="generate-link-title"
              className="text-[15px] font-bold text-[var(--tk-ink)]"
            >
              Measurement link
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-[var(--tk-ink-muted)]">
              {subscriptionBlocked
                ? "Renew your subscription to create measurement links."
                : selected
                ? "Generate a personal, single-use link. It expires in 24 hours and works once."
                : mode === "new"
                ? "Enter the customer's name. They'll complete the rest on the form."
                : "Pick a customer to create their personal measurement link."}
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
          {/* FREE TRIAL */}
          {onFreeTrial && !result && (
            <div className="mb-4 rounded-[10px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[11px] leading-5 text-[var(--tk-ink-muted)]">
              <span className="font-semibold text-[var(--tk-ink)]">Free plan</span>{" "}
              — {freeLinksRemaining} of {state.subscription.freeLinksLimit} free
              measurement {freeLinksRemaining === 1 ? "link" : "links"} left.
            </div>
          )}

          {/* SUBSCRIPTION BLOCKED */}
          {subscriptionBlocked && (
            <div className="flex gap-2.5 rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-3 text-[11px] leading-5 text-[#B91C1C]">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Link generation is paused</p>
                <p className="mt-0.5">{subscriptionMessage}</p>
              </div>
            </div>
          )}

          {/* LINK TYPE TOGGLE */}
          {showModeToggle && (
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-[10px] bg-[var(--tk-surface-muted)] p-1">
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({ ...previous, mode: "existing", error: "" }))
                }
                aria-pressed={mode === "existing"}
                className={`flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-semibold transition ${
                  mode === "existing"
                    ? "bg-[var(--tk-bg-elevated)] text-[var(--tk-ink)] shadow-sm"
                    : "text-[var(--tk-ink-muted)] hover:text-[var(--tk-ink)]"
                }`}
              >
                <UserRound size={13} />
                Existing customer
              </button>

              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({ ...previous, mode: "new", error: "" }))
                }
                aria-pressed={mode === "new"}
                className={`flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-semibold transition ${
                  mode === "new"
                    ? "bg-[var(--tk-bg-elevated)] text-[var(--tk-ink)] shadow-sm"
                    : "text-[var(--tk-ink-muted)] hover:text-[var(--tk-ink)]"
                }`}
              >
                <UserPlus size={13} />
                New customer
              </button>
            </div>
          )}

          {/* NEW CUSTOMER FORM */}
          {showNewCustomerForm && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="new-customer-first"
                  className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)]"
                >
                  First name
                </label>
                <input
                  id="new-customer-first"
                  type="text"
                  value={newCustomer.firstName}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      newCustomer: {
                        ...previous.newCustomer,
                        firstName: event.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Chukwuma"
                  maxLength={60}
                  className="mt-1.5 w-full rounded-[9px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[12px] text-[var(--tk-ink)] outline-none placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)]"
                />
              </div>

              <div>
                <label
                  htmlFor="new-customer-last"
                  className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)]"
                >
                  Last name
                </label>
                <input
                  id="new-customer-last"
                  type="text"
                  value={newCustomer.lastName}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      newCustomer: {
                        ...previous.newCustomer,
                        lastName: event.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Johnson"
                  maxLength={60}
                  className="mt-1.5 w-full rounded-[9px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[12px] text-[var(--tk-ink)] outline-none placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)]"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="new-customer-phone"
                  className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)]"
                >
                  Phone number (optional)
                </label>
                <input
                  id="new-customer-phone"
                  type="tel"
                  value={newCustomer.phoneNumber}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      newCustomer: {
                        ...previous.newCustomer,
                        phoneNumber: event.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. +2348012345678"
                  maxLength={20}
                  className="mt-1.5 w-full rounded-[9px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[12px] text-[var(--tk-ink)] outline-none placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)]"
                />
              </div>

              <p className="col-span-2 -mt-1 text-[10px] leading-4 text-[var(--tk-ink-muted)]">
                The customer fills in their phone and gender when they open the link.
              </p>

              <div className="col-span-2">
                <label
                  htmlFor="new-customer-order-reference"
                  className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)]"
                >
                  Order reference (optional)
                </label>
                <input
                  id="new-customer-order-reference"
                  type="text"
                  value={orderReference}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      orderReference: event.target.value,
                    }))
                  }
                  placeholder="e.g. ORD-002"
                  className="mt-1.5 w-full rounded-[9px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[12px] text-[var(--tk-ink)] outline-none placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)]"
                />
              </div>
            </div>
          )}

          {/* CUSTOMER PICKER */}
          {showPicker && (
            <div>
              <label className="mb-1.5 flex h-[42px] items-center gap-2.5 rounded-[10px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 focus-within:border-[var(--tk-brand)]">
                <Search size={16} className="shrink-0 text-[var(--tk-ink-muted)]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      searchTerm: event.target.value,
                    }))
                  }
                  placeholder="Search customers…"
                  aria-label="Search customers"
                  className="h-full w-full bg-transparent text-[13px] text-[var(--tk-ink)] outline-none placeholder:text-[var(--tk-ink-muted)]"
                />
              </label>

              <div className="mt-3">
                {listLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-[var(--tk-ink-muted)]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--tk-border-strong)] border-t-[var(--tk-brand)]" />
                    Loading customers…
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="py-8 text-center">
                    <UserRound
                      size={22}
                      className="mx-auto text-[var(--tk-ink-muted)]"
                    />
                    <p className="mt-2 text-[12px] font-medium text-[var(--tk-ink)]">
                      {searchTerm ? "No matching customers" : "No customers yet"}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--tk-ink-muted)]">
                      {searchTerm
                        ? "Try a different name or number."
                        : "Add a customer first, then generate their link."}
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {filteredCustomers.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setState((previous) => ({
                              ...previous,
                              selected: item,
                            }))
                          }
                          className="flex w-full items-center gap-3 rounded-[10px] border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-3 py-2.5 text-left transition hover:bg-[var(--tk-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/40"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-brand)] text-[12px] font-bold text-[var(--tk-brand-ink)]">
                            {customerDisplayName(item).charAt(0).toUpperCase()}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-[var(--tk-ink)]">
                              {customerDisplayName(item)}
                            </span>
                            <span className="block truncate text-[11px] text-[var(--tk-ink-muted)]">
                              {customerDisplayPhone(item)}
                            </span>
                          </span>

                          <Link2 size={15} className="shrink-0 text-[var(--tk-brand)]" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ORDER REFERENCE + CONFIRM */}
          {selected && !result && !error && !subscriptionBlocked && (            <div>
              <div className="mb-4 flex items-center gap-3 rounded-[10px] bg-[var(--tk-surface-muted)] px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-brand)] text-[12px] font-bold text-[var(--tk-brand-ink)]">
                  {customerDisplayName(selected).charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[var(--tk-ink)]">
                    {customerDisplayName(selected)}
                  </p>
                  <p className="truncate text-[11px] text-[var(--tk-ink-muted)]">
                    {customerDisplayPhone(selected)}
                  </p>
                </div>

                {!customer && (
                  <button
                    type="button"
                    onClick={() =>
                      setState((previous) => ({ ...previous, selected: null }))
                    }
                    className="shrink-0 text-[11px] font-semibold text-[var(--tk-brand)] transition hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>

              <label
                htmlFor="generate-order-reference"
                className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)]"
              >
                Order reference (optional)
              </label>
              <input
                id="generate-order-reference"
                type="text"
                value={orderReference}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    orderReference: event.target.value,
                  }))
                }
                placeholder="e.g. ORD-002"
                className="mt-1.5 w-full rounded-[9px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[12px] text-[var(--tk-ink)] outline-none placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)]"
              />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2.5 text-[11px] leading-5 text-[#B91C1C]">
              {error}
            </div>
          )}

          {/* RESULT */}
          {result?.link && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)]">
                Share this with {result.customerName}
              </label>
              <div className="mt-1.5 break-all rounded-[9px] border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-2.5 text-[11px] font-medium text-[var(--tk-ink)]">
                {result.link}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex items-center justify-center gap-1.5 rounded-[9px] border border-[var(--tk-border)] bg-[var(--tk-surface)] px-3 py-2.5 text-[11px] font-semibold text-[var(--tk-ink)] transition hover:opacity-90"
                >
                  <Copy size={13} />
                  Copy link
                </button>

                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-[9px] bg-[#25D366] px-3 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                >
                  <FaWhatsapp size={13} />
                  WhatsApp
                </button>
              </div>

              <button
                type="button"
                onClick={shareMore}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-[var(--tk-border)] px-3 py-2.5 text-[11px] font-semibold text-[var(--tk-brand)] transition hover:bg-[var(--tk-surface)]"
              >
                <Share2 size={13} />
                More sharing options
              </button>
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
            {result ? "Done" : "Cancel"}
          </button>

          {!result && !subscriptionBlocked && (canSubmit || showNewCustomerForm) && (
            <button
              type="button"
              onClick={submit}
              disabled={loading || !canSubmit}
              className="flex items-center justify-center gap-1.5 rounded-[9px] bg-[var(--tk-brand)] px-4 py-2 text-[12px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
              ) : (
                <Link2 size={13} />
              )}
              {loading ? "Generating…" : error ? "Try again" : "Generate link"}
            </button>
          )}
        </div>
      </div>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
