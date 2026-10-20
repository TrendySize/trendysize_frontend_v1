import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Ban, Phone, SearchX, WifiOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { probeVendorVanity, backendVanityUrl } from "../services/api";

const MEASURE_TOKEN_KEY = "trendySize_measure_token";

/*
|--------------------------------------------------------------------------
| CUSTOMER PROFILE (public vendor landing, query-string variant)
|--------------------------------------------------------------------------
|
| Reached as /customer-profile?username=...&token=...
| Probes the vendor vanity endpoint (guide §6.1):
|   - active   → forward to the backend 302 → wa.me (preserving measure token)
|   - inactive / not-found → friendly result card showing the backend message
|
*/

const COPY = {
  inactive: {
    title: "This vendor is unavailable",
    body:
      "This vendor's account is currently inactive. Please try again later or reach out to them another way.",
    icon: Ban,
  },
  notfound: {
    title: "Vendor not found",
    body:
      "We couldn't find a vendor with this link. Double-check the link you were given and try again.",
    icon: SearchX,
  },
  error: {
    title: "Something went wrong",
    body:
      "We couldn't open this vendor right now. Please check your connection and try again.",
    icon: WifiOff,
  },
};

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const username = params.get("username") || params.get("vendor") || "";
  const measureToken =
    params.get("token") || params.get("measurementToken") || "";

  const hasUsername = username.trim().length > 0;

  const [state, setState] = useState({
    status: hasUsername ? "loading" : "notfound",
    message: hasUsername
      ? ""
      : "Open the link exactly as it was shared with you.",
  });

  const navigatedRef = useRef(false);

  useEffect(() => {
    if (!hasUsername) return undefined;

    if (measureToken) {
      try {
        localStorage.setItem(MEASURE_TOKEN_KEY, measureToken);
      } catch {
        // Storage may be unavailable (private mode); non-fatal.
      }
    }

    let active = true;

    const run = async () => {
      const result = await probeVendorVanity(username);
      if (!active) return;

      if (result.kind === "redirect") {
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          window.location.replace(backendVanityUrl(username));
        }
        return;
      }

      setState({ status: result.kind, message: result.message });
    };

    run();

    return () => {
      active = false;
    };
  }, [hasUsername, username, measureToken]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F3FF]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D8D6FE] border-t-[#6133DA]" />
          <p className="mt-3 text-sm text-[#8179AD]">
            Connecting you to WhatsApp...
          </p>
        </div>
      </div>
    );
  }

  const config = COPY[state.status] || COPY.error;
  const Icon = config.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tk-bg)] px-5 text-center">
      <div className="w-full max-w-[380px]">
        <span
          className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(220, 38, 38, 0.12)" }}
        >
          <Icon size={24} className="text-[#DC2626]" aria-hidden="true" />
        </span>

        <h1 className="mt-4 text-[17px] font-bold text-[var(--tk-ink)]">
          {config.title}
        </h1>

        <p className="mx-auto mt-2 max-w-[34ch] text-[13px] leading-6 text-[var(--tk-ink-soft)]">
          {state.message || config.body}
        </p>

        {measureToken && (
          <button
            type="button"
            onClick={() => navigate(`/measure?token=${measureToken}`)}
            className="mt-5 inline-flex items-center gap-2 rounded-[6px] bg-[#6133DA] px-5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#5128BC]"
          >
            <Phone size={13} />
            Continue to measurement
          </button>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[var(--tk-ink-muted)]">
          <AlertTriangle size={12} aria-hidden="true" />
          If this keeps happening, contact the vendor directly.
        </p>
      </div>
    </div>
  );
}
