import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  MapPin,
  MessageCircle,
  SearchX,
  Sparkles,
  Store,
  WifiOff,
} from "lucide-react";

import { getPublicVendorProfile, backendVanityUrl } from "../services/api";

/*
|--------------------------------------------------------------------------
| PUBLIC VENDOR PROFILE (customer-facing)
|--------------------------------------------------------------------------
|
| The page a visiting customer sees at {origin}/vendor/{username}. It reads
| the vendor's public business profile (guide §6.3) and shows their banner,
| avatar, business info and a WhatsApp button.
|
| The WhatsApp button links to the backend vanity endpoint
| GET /api/public/v/{username} (guide §6.1), which 302s to wa.me — we never
| expose the raw phone number to the page.
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

function initialsOf(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function PublicVendorProfile() {
  const { username: rawUsername } = useParams();
  const username = (rawUsername || "").trim();
  const hasUsername = username.length > 0;

  const [state, setState] = useState({
    status: hasUsername ? "loading" : "notfound",
    message: hasUsername ? "" : "This link is incomplete.",
    vendor: null,
  });
  const [attempt, setAttempt] = useState(0);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let active = true;

    if (!hasUsername) return undefined;

    // Set the loading state in a microtask so no setState runs synchronously
    // inside the effect body (avoids cascading renders / lint rule).
    Promise.resolve().then(() => {
      if (active) {
        setState({ status: "loading", message: "", vendor: null });
      }
    });

    getPublicVendorProfile(username)
      .then((vendor) => {
        if (!active) return;
        setState({ status: "ready", message: "", vendor });
      })
      .catch((error) => {
        if (!active) return;
        console.error("Could not load vendor profile:", error);
        let status = "error";
        if (error?.status === 404) status = "notfound";
        else if (error?.status === 400) status = "inactive";
        setState({ status, message: error?.message || "", vendor: null });
      });

    return () => {
      active = false;
    };
  }, [hasUsername, username, attempt]);

  const recheck = () => setAttempt((n) => n + 1);

  if (state.status === "loading") {
    return (
      <Shell>
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[var(--tk-border-strong)] border-t-[var(--tk-brand)]" />
        <p className="mt-3 text-[13px] font-medium text-[var(--tk-ink-soft)]">
          Loading vendor…
        </p>
      </Shell>
    );
  }

  if (state.status !== "ready" || !state.vendor) {
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

        <h1 className="mt-4 text-[17px] font-bold text-[var(--tk-ink)]">
          {config.title}
        </h1>

        <p className="mx-auto mt-2 max-w-[34ch] text-[13px] leading-6 text-[var(--tk-ink-soft)]">
          {state.message || config.body}
        </p>

        <button
          type="button"
          onClick={recheck}
          className="mt-6 inline-flex items-center gap-2 rounded-[9px] bg-[var(--tk-brand)] px-5 py-2.5 text-[12px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90"
        >
          <MessageCircle size={14} aria-hidden="true" />
          Try again
        </button>
      </Shell>
    );
  }

  const vendor = state.vendor;
  const personalName = [vendor.firstName, vendor.lastName]
    .filter(Boolean)
    .join(" ");
  const displayName = vendor.businessName || personalName || "Vendor";
  const location = [vendor.city, vendor.region].filter(Boolean).join(", ");
  const canWhatsApp = vendor.hasWhatsapp !== false;

  return (
    <div className="min-h-screen bg-[var(--tk-bg)]">
      <div className="mx-auto w-full max-w-[880px] px-4 pb-12 sm:px-6">
        {/* BANNER */}
        <div className="relative mt-4 h-[150px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#6133DA] to-[#9B8AFB] sm:h-[190px]">
          {vendor.bannerImageUrl && !bannerFailed ? (
            <img
              src={vendor.bannerImageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBannerFailed(true)}
            />
          ) : null}
        </div>

        {/* AVATAR + NAME */}
        <div className="relative px-1">
          <div className="-mt-12 flex items-end gap-4">
            <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--tk-bg)] bg-[#241065] text-[28px] font-bold text-[#9B8CF9] shadow-md">
              {vendor.profileImageUrl && !avatarFailed ? (
                <img
                  src={vendor.profileImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                initialsOf(displayName)
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-[22px] font-bold text-[var(--tk-ink)] sm:text-[26px]">
              {displayName}
            </h1>

            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--tk-ink-muted)]">
                <MapPin size={14} className="shrink-0" aria-hidden="true" />
                {location}
              </p>
            )}

            {vendor.specialization && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[var(--tk-brand)]">
                <Sparkles size={14} className="shrink-0" aria-hidden="true" />
                {vendor.specialization}
              </p>
            )}

            {vendor.tagline && (
              <p className="mt-3 text-[14px] font-medium italic text-[var(--tk-ink-soft)]">
                “{vendor.tagline}”
              </p>
            )}
          </div>
        </div>

        {/* ABOUT */}
        {vendor.description && (
          <section className="mt-6 rounded-2xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--tk-ink)]">
              <Store size={15} aria-hidden="true" />
              About
            </h2>
            <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[var(--tk-ink-soft)]">
              {vendor.description}
            </p>
          </section>
        )}

        {/* WHATSAPP CTA */}
        <div className="mt-6">
          {canWhatsApp ? (
            <a
              href={backendVanityUrl(username)}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-[14px] font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Chat on WhatsApp
            </a>
          ) : (
            <p className="rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-4 py-3 text-center text-[12px] text-[var(--tk-ink-muted)]">
              This vendor hasn't added a WhatsApp number yet.
            </p>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[var(--tk-ink-muted)]">
            <ArrowLeft size={12} aria-hidden="true" />
            Measurements are taken in a private, secure flow.
          </p>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tk-bg)] px-5 text-center">
      <div className="w-full max-w-[380px]">{children}</div>
    </div>
  );
}
