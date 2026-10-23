import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  SearchX,
  WifiOff,
  MessageCircle,
} from "lucide-react";

import { probeVendorVanity, backendVanityUrl } from "../services/api";

/*
|--------------------------------------------------------------------------
| VENDOR LANDING (public vanity link result page)
|--------------------------------------------------------------------------
|
| A visitor opening {origin}/v/{username} is forwarded to the backend
| vanity endpoint GET /api/public/v/{username} (guide §6.1):
|   - active vendor   → 302 to wa.me (we navigate the browser there)
|   - inactive        → 400 "This vendor's account is currently inactive."
|   - not found       → 404 "Vendor not found."
|   - missing/invalid WhatsApp number → 400 "..."
|
| Instead of dumping raw JSON on the visitor, we probe the endpoint and
| render a friendly result page.
|
*/

const COPY = {
  inactive: {
    title: "This vendor is unavailable",
    body:
      "This vendor's account is currently inactive. Please try again later or reach out to them another way.",
    icon: Ban,
    tone: "error",
  },
  notfound: {
    title: "Vendor not found",
    body:
      "We couldn't find a vendor with this link. Double-check the link you were given and try again.",
    icon: SearchX,
    tone: "error",
  },
  error: {
    title: "Something went wrong",
    body:
      "We couldn't open this vendor right now. Please check your connection and try again.",
    icon: WifiOff,
    tone: "error",
  },
};

export default function VendorLanding() {
  const { username: rawUsername } = useParams();
  const username = (rawUsername || "").trim();

  const hasUsername = username.length > 0;

  const [state, setState] = useState({
    status: hasUsername ? "loading" : "notfound",
    message: hasUsername ? "" : "This link is incomplete.",
  });

  const navigatedRef = useRef(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    if (!hasUsername) {
      return undefined;
    }

    const run = async () => {
      setState({ status: "loading", message: "" });

      const result = await probeVendorVanity(username);
      if (!active) return;

      if (result.kind === "redirect") {
        // Vendor is active - hand off to the backend's 302 → wa.me.
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          window.location.replace(backendVanityUrl(username));
        }
        return;
      }

      setState({
        status: result.kind,
        message: result.message,
      });
    };

    run();

    return () => {
      active = false;
    };
  }, [hasUsername, username, attempt]);

  // Re-run the in-app probe (never send the visitor to the raw backend URL).
  const recheck = () => setAttempt((n) => n + 1);

  if (state.status === "loading") {
    return (
      <Shell>
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[var(--tk-border-strong)] border-t-[var(--tk-brand)]" />
        <p className="mt-3 text-sm font-medium text-[var(--tk-ink-soft)]">
          Connecting you to the vendor…
        </p>
      </Shell>
    );
  }

  const config = COPY[state.status] || COPY.error;
  const Icon = config.icon;

  return (
    <Shell>
      <span
        className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(220, 38, 38, 0.12)" }}
      >
        <Icon size={24} className="text-[#DC2626]" aria-hidden="true" />
      </span>

      <h1 className="mt-4 text-base font-bold text-[var(--tk-ink)]">
        {config.title}
      </h1>

      <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-6 text-[var(--tk-ink-soft)]">
        {state.message || config.body}
      </p>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={recheck}
          className="inline-flex items-center gap-2 rounded-[9px] bg-[var(--tk-brand)] px-5 py-2.5 text-xs font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90"
        >
          <MessageCircle size={14} aria-hidden="true" />
          Try again
        </button>

        <p className="flex items-center gap-1.5 text-xs text-[var(--tk-ink-muted)]">
          <AlertTriangle size={12} aria-hidden="true" />
          If this keeps happening, contact the vendor directly.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tk-bg)] px-5 text-center">
      <div className="w-full max-w-[380px]">{children}</div>
    </div>
  );
}
