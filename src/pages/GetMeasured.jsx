import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Link2,
  LockKeyhole,
  Ruler,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MeasurementBrand from "../components/MeasurementBrand";
import { getPublicMeasurementLink } from "../services/api";
import {
  CUSTOMER_DETAILS_KEY,
  MEASURE_TOKEN_KEY,
  loadMeasurementToken,
  saveMeasurementToken,
  saveMeasurementVendor,
} from "../measurementSession";

function formatRemaining(expiresAt, now) {
  const time = new Date(expiresAt).getTime();
  if (Number.isNaN(time)) return "";
  const remaining = time - now;
  if (remaining <= 0) return "Expired";

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);

  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${Math.max(1, minutes)}m left`;
}

const LINK_COPY = {
  invalid: {
    icon: XCircle,
    title: "This link is not valid",
    body: "Double-check the link the vendor sent you, or ask them to generate a new one.",
  },
  missing: {
    icon: Link2,
    title: "This link is incomplete",
    body: "Open the exact link the vendor shared with you so we can match your measurements to their order.",
  },
  expired: {
    icon: Clock3,
    title: "This link has expired",
    body: "Measurement links last 24 hours. Ask the vendor to resend a fresh link.",
  },
  submitted: {
    icon: CheckCircle2,
    title: "Measurements already submitted",
    body: "This link has already been used. Your vendor has your measurements and will follow up about the order.",
  },
  completed: {
    icon: CheckCircle2,
    title: "Measurements already submitted",
    body: "This link has already been used. Your vendor has your measurements and will follow up about the order.",
  },
  manual_review: {
    icon: CheckCircle2,
    title: "Your photos are with the vendor",
    body: "We could not get a reliable result automatically, so the vendor will review your photos and complete the measurements manually.",
  },
  unavailable: {
    icon: AlertTriangle,
    title: "This link is unavailable",
    body: "Ask the vendor to create a new measurement link for you.",
  },
  error: {
    icon: AlertTriangle,
    title: "We could not open this link",
    body: "Check your connection and try again, or ask the vendor to resend the link.",
  },
};

function LinkStateCard({ status, message, vendor, onRetry }) {
  const config = LINK_COPY[status] || LINK_COPY.error;
  const Icon = config.icon;
  const storeLink = vendor?.username ? `/vendor/${vendor.username}` : "";

  return (
    <div className="mx-auto w-full max-w-[520px] rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-surface)]">
        <Icon size={23} className="text-[var(--tk-brand)]" aria-hidden="true" />
      </span>

      <h1 className="mt-4 text-lg font-bold text-[var(--tk-ink)]">
        {config.title}
      </h1>

      <p className="mx-auto mt-2 max-w-[42ch] text-sm leading-6 text-[var(--tk-ink-soft)]">
        {message || config.body}
      </p>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        {status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--tk-brand)] px-5 text-xs font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/50"
          >
            Try again
          </button>
        )}

        {storeLink && (
          <a
            href={storeLink}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-5 text-xs font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/40"
          >
            Back to store
          </a>
        )}
      </div>
    </div>
  );
}

export default function GetMeasured() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || loadMeasurementToken();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("1");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [error, setError] = useState("");

  const [link, setLink] = useState(() => ({
    status: token ? "loading" : "missing",
    data: null,
    message: "",
  }));
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    saveMeasurementToken(token);

    getPublicMeasurementLink(token)
      .then((data) => {
        if (!active) return;

        saveMeasurementVendor(data.vendor);
        setLink({
          status: data.canSubmit ? "ready" : data.state || "unavailable",
          data,
          message: "",
        });

        try {
          const savedRaw = localStorage.getItem(CUSTOMER_DETAILS_KEY);
          const saved = savedRaw ? JSON.parse(savedRaw) : null;
          if (saved) {
            setFirstName(saved.firstName || "");
            setLastName(saved.lastName || "");
            setPhoneNumber(saved.phoneNumber || "");
            setGender(String(saved.gender ?? 1));
            setHeight(saved.height || "");
            setHeightUnit(saved.heightUnit || "cm");
          } else {
            setFirstName(data.customerFirstName || "");
            setLastName(data.customerLastName || "");
          }
        } catch {
          setFirstName(data.customerFirstName || "");
          setLastName(data.customerLastName || "");
        }
      })
      .catch((fetchError) => {
        if (!active) return;
        console.error("Could not open measurement link:", fetchError);
        setLink({
          status:
            fetchError?.status === 404
              ? "invalid"
              : fetchError?.status === 400
                ? "unavailable"
                : "error",
          data: null,
          message: fetchError?.message || "",
        });
      });

    return () => {
      active = false;
    };
  }, [token, attempt]);

  useEffect(() => {
    if (!link.data?.expiresAt) return undefined;

    const tick = () => setNow(Date.now());
    const initial = setTimeout(tick, 0);
    const timer = setInterval(tick, 30_000);

    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [link.data?.expiresAt]);

  const expiresAt = link.data?.expiresAt || "";
  const expiredNow = Boolean(expiresAt) && Boolean(now) && new Date(expiresAt).getTime() <= now;
  const remaining = expiresAt
    ? now
      ? formatRemaining(expiresAt, now)
      : "24h window"
    : "";
  const vendor = link.data?.vendor || null;
  const canContinue = link.status === "ready" && !expiredNow;

  const retryLink = () => {
    setLink((current) => ({ ...current, status: "loading", message: "" }));
    setAttempt((value) => value + 1);
  };

  const handleContinue = (event) => {
    event.preventDefault();

    if (!canContinue) {
      setError("This measurement link is no longer available. Ask the vendor for a new link.");
      return;
    }

    const value = Number(height);

    if (!firstName.trim() && !lastName.trim()) {
      setError("Please enter your name so the vendor knows who this is for.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number so the vendor can reach you.");
      return;
    }

    if (!height.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Please enter your height so we can calibrate your measurements.");
      return;
    }

    if (heightUnit === "ft" && (value < 3 || value > 8)) {
      setError("Please enter a height between 3 and 8 feet.");
      return;
    }

    if (heightUnit === "cm" && (value < 90 || value > 250)) {
      setError("Please enter a height between 90 and 250 cm.");
      return;
    }

    setError("");

    localStorage.setItem(
      CUSTOMER_DETAILS_KEY,
      JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender: Number(gender),
        height: height.trim(),
        heightUnit,
      })
    );
    localStorage.setItem(MEASURE_TOKEN_KEY, token);

    navigate(`/how-it-works?token=${encodeURIComponent(token)}`);
  };

  if (link.status === "loading") {
    return (
      <div className="relative min-h-screen bg-transparent px-4 py-3 text-[var(--tk-ink)]">
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-24px)] max-w-[620px] flex-col">
          <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#A9A6B5]">
            <div className="h-full w-[13%] bg-[#6133DA]" />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--tk-border-strong)] border-t-[var(--tk-brand)]" />
              <p className="mt-3 text-sm font-medium text-[var(--tk-ink-soft)]">
                Opening your measurement link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (link.status !== "ready") {
    return (
      <div className="relative min-h-screen bg-transparent px-4 py-3 text-[var(--tk-ink)]">
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-24px)] max-w-[720px] flex-col">
          <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#A9A6B5]">
            <div className="h-full w-[13%] bg-[#6133DA]" />
          </div>

          {vendor && <MeasurementBrand vendor={vendor} className="mt-5" />}

          <div className="flex flex-1 items-center justify-center py-8">
            <LinkStateCard
              status={expiredNow ? "expired" : link.status}
              message={link.message}
              vendor={vendor}
              onRetry={retryLink}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent px-4 py-3 text-[var(--tk-ink)]">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1180px] flex-col">
        <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#A9A6B5]">
          <div className="h-full w-[13%] bg-[#6133DA]" />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[32px] items-center justify-center gap-2 rounded-lg border border-[#D8D6FE] bg-[#EBE9FE] px-4 text-xs font-medium text-[#241065] transition hover:bg-[#D8D6FE]"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {remaining && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                expiredNow
                  ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]"
                  : "border-[var(--tk-border)] bg-[var(--tk-surface)] text-[var(--tk-ink-soft)]"
              }`}
            >
              <Clock3 size={12} aria-hidden="true" />
              {remaining}
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-col items-center text-center">
          <MeasurementBrand vendor={vendor} />

          <h1 className="mt-4 text-3xl font-bold text-[#241065]">
            Let’s get your details
          </h1>

          <p className="mx-auto mt-1 max-w-[520px] text-xs leading-5 text-[#6B7280]">
            {vendor?.businessName
              ? `${vendor.businessName} needs a few details before you take your photos.`
              : "Tell us who you are and your height, then capture your photos."}{" "}
            Your measurements stay private and are shared only with the vendor.
          </p>
        </div>

        <form onSubmit={handleContinue} className="mx-auto mt-5 w-full max-w-[720px]">
          <div className="rounded-xl border border-[#D8D6FE] bg-white p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-[#241065]">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="e.g. Chukwuma"
                  maxLength={60}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-sm text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-[#241065]">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="e.g. Johnson"
                  maxLength={60}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-sm text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-[#241065]">
                  Phone number
                  <span className="ml-1 font-normal text-[#6B7280]">(required)</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="e.g. +2348012345678"
                  maxLength={20}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-sm text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                />
              </div>

              <div>
                <label htmlFor="gender" className="mb-2 block text-sm font-semibold text-[#241065]">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-sm text-[#241065] outline-none transition focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                >
                  <option value="1">Female</option>
                  <option value="0">Male</option>
                </select>
              </div>
            </div>

            <div className="mt-6 border-t border-[#EEF0F6] pt-5">
              <div className="mt-1">
                <label htmlFor="height" className="mb-2 block text-sm font-semibold text-[#241065]">
                  Height
                  <span className="ml-1 font-normal text-[#6B7280]">(required)</span>
                </label>

                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Ruler
                      size={17}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#6133DA]"
                    />
                    <input
                      id="height"
                      type="number"
                      inputMode="decimal"
                      min="1"
                      value={height}
                      onChange={(event) => setHeight(event.target.value)}
                      placeholder="Enter your height"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "height-error" : undefined}
                      className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] pl-11 pr-4 text-sm text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setHeightUnit("cm")}
                    aria-pressed={heightUnit === "cm"}
                    className={`h-[46px] w-[55px] rounded-lg text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 ${
                      heightUnit === "cm"
                        ? "bg-[#6133DA] text-white"
                        : "border border-[#D8D6FE] bg-[#F4F3FF] text-[#4B5563]"
                    }`}
                  >
                    cm
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeightUnit("ft")}
                    aria-pressed={heightUnit === "ft"}
                    className={`h-[46px] w-[55px] rounded-lg text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 ${
                      heightUnit === "ft"
                        ? "bg-[#6133DA] text-white"
                        : "border border-[#D8D6FE] bg-[#F4F3FF] text-[#4B5563]"
                    }`}
                  >
                    ft
                  </button>
                </div>

                <p
                  id="height-error"
                  role="alert"
                  className={`mt-2 text-xs font-medium text-[#B91C1C] ${error ? "" : "hidden"}`}
                >
                  {error}
                </p>
              </div>
            </div>

            {expiredNow && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2.5 text-xs leading-5 text-[#B91C1C]">
                <Clock3 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>This link expired while you were filling the form. Ask the vendor to resend it.</p>
              </div>
            )}

            <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#EBE9FE] px-4 py-3">
              <LockKeyhole size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[#6133DA]" />
              <div className="text-xs leading-5 text-[#241065]">
                <p className="font-semibold">Your photos stay private</p>
                <p className="mt-0.5 text-[#5B5280]">
                  They are used only to calculate your measurements for this order. They are never posted publicly. You can ask {vendor?.businessName || "the vendor"} to delete them after your order.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canContinue}
              className="mt-6 flex h-[46px] w-full items-center justify-center rounded-lg bg-[#6133DA] text-sm font-semibold text-white transition hover:bg-[#4D26B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[#6B7280]">
              <ShieldCheck size={13} aria-hidden="true" />
              Shared only with {vendor?.businessName || "your vendor"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
