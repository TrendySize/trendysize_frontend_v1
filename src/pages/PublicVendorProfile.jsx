import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Ban,
  Check,
  ExternalLink,
  Images,
  MapPin,
  MessageCircle,
  Ruler,
  SearchX,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  WifiOff,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { getPublicVendorProfile, backendVanityUrl } from "../services/api";

/*
|--------------------------------------------------------------------------
| PUBLIC VENDOR PROFILE (customer-facing storefront)
|--------------------------------------------------------------------------
|
| The page a visiting customer sees at {origin}/vendor/{username}. It reads
| the vendor's public business profile (guide §6.3) and presents their
| storefront: banner, avatar, business identity, location, specialization,
| tagline, an About section, and a prominent "Chat on WhatsApp" action.
|
| The WhatsApp button links to the backend vanity endpoint
| GET /api/public/v/{username} (guide §6.1), which 302s to wa.me — we never
| expose the raw phone number to the page.
|
| Visitors only ever see public business information. Every field the vendor
| has not filled in is omitted rather than shown as an empty placeholder; if
| the vendor has added no store details at all, a friendly note explains it.
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
  const [shareState, setShareState] = useState("");

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
        <p className="mt-3 text-sm font-medium text-[var(--tk-ink-soft)]">
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
        <span className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#DC2626]/10">
          <Icon size={24} className="text-[#DC2626]" aria-hidden="true" />
        </span>

        <h1 className="mt-4 text-base font-bold text-[var(--tk-ink)]">
          {config.title}
        </h1>

        <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-6 text-[var(--tk-ink-soft)]">
          {state.message || config.body}
        </p>

        <button
          type="button"
          onClick={recheck}
          className="mt-6 inline-flex items-center gap-2 rounded-[9px] bg-[var(--tk-brand)] px-5 py-2.5 text-xs font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/50"
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
  const hasWhatsApp = vendor.hasWhatsapp !== false;

  const craftTags = Array.isArray(vendor.craftTags)
    ? vendor.craftTags.filter((tag) => String(tag).trim())
    : [];
  const featuredWork = Array.isArray(vendor.featuredWork)
    ? vendor.featuredWork.filter((item) => item?.imageUrl)
    : [];
  const stats = [];
  if (vendor.yearsExperience != null) {
    stats.push({
      label: vendor.yearsExperience === 1 ? "Year of craft" : "Years of craft",
      value: vendor.yearsExperience,
    });
  }
  if (vendor.outfitsMade != null) {
    stats.push({ label: "Outfits made", value: vendor.outfitsMade });
  }

  const shareStore = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${displayName} on TrendySize`,
          text: `Take a look at ${displayName} on TrendySize.`,
          url,
        });
        setShareState("Shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareState("Link copied");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Could not share storefront:", error);
        setShareState("Could not share");
      }
    }
  };

  const hasDetails = Boolean(
    vendor.tagline ||
      vendor.description ||
      location ||
      vendor.specialization ||
      vendor.businessName ||
      craftTags.length > 0 ||
      stats.length > 0 ||
      featuredWork.length > 0
  );

  return (
    <div className="relative min-h-screen bg-transparent text-[var(--tk-ink)]">
      <main className="relative z-10 mx-auto w-full max-w-[720px] px-4 pb-16 sm:px-6">
        {/* BANNER */}
        <div className="relative mt-4 h-[150px] overflow-hidden rounded-xl bg-[var(--tk-brand)] sm:h-[190px]">
          {vendor.bannerImageUrl && !bannerFailed ? (
            <img
              src={vendor.bannerImageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBannerFailed(true)}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--tk-brand) 0%, var(--tk-brand) 55%, rgba(255,255,255,0.18) 100%)",
              }}
            />
          )}
        </div>

        {/* IDENTITY */}
        <div className="relative px-1">
          <div className="-mt-12 flex items-end gap-4">
            <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-[var(--tk-bg)] bg-[#241065] text-3xl font-bold text-[#9B8CF9] ">
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
            <h1 className="text-2xl font-bold text-[var(--tk-ink)] sm:text-3xl">
              {displayName}
            </h1>

            <p className="mt-1 text-xs font-medium text-[var(--tk-ink-muted)]">
              @{vendor.username || username}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={shareStore}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/40"
              >
                {shareState === "Shared" || shareState === "Link copied" ? (
                  <Check size={13} aria-hidden="true" />
                ) : (
                  <Share2 size={13} aria-hidden="true" />
                )}
                {shareState || "Share store"}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {location && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-3 py-1 text-xs text-[var(--tk-ink-soft)]">
                  <MapPin size={13} className="shrink-0" aria-hidden="true" />
                  {location}
                </span>
              )}

              {vendor.specialization && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-brand)]/30 bg-[var(--tk-brand)]/10 px-3 py-1 text-xs font-medium text-[var(--tk-brand)]">
                  <Sparkles size={13} className="shrink-0" aria-hidden="true" />
                  {vendor.specialization}
                </span>
              )}
            </div>

            {vendor.tagline && (
              <p className="mt-4 text-sm font-medium italic text-[var(--tk-ink-soft)]">
                “{vendor.tagline}”
              </p>
            )}

            {craftTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {craftTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--tk-ink-soft)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {stats.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-4 py-2.5"
                  >
                    <p className="text-lg font-bold leading-none text-[var(--tk-ink)]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--tk-ink-muted)]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ABOUT */}
        {vendor.description && (
          <section className="mt-6 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] p-5 ">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--tk-ink)]">
              <Store size={15} aria-hidden="true" />
              About
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--tk-ink-soft)]">
              {vendor.description}
            </p>
          </section>
        )}

        {/* FEATURED WORK */}
        {featuredWork.length > 0 && (
          <section className="mt-6 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] p-5 ">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--tk-ink)]">
              <Images size={15} aria-hidden="true" />
              Featured Work
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {featuredWork.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)]"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Featured work"}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  {item.name && (
                    <figcaption className="px-2.5 py-2 text-xs font-medium text-[var(--tk-ink-soft)]">
                      {item.name}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* PORTFOLIO LINK */}
        {vendor.portfolioUrl && (
          <a
            href={vendor.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--tk-ink)] transition hover:border-[var(--tk-brand)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/40"
          >
            <ExternalLink size={15} aria-hidden="true" />
            View full portfolio
          </a>
        )}

        {/* EMPTY-DETAILS NOTE — only when the vendor has added nothing yet. */}
        {!hasDetails && (
          <p className="mt-6 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-4 py-4 text-center text-xs leading-6 text-[var(--tk-ink-muted)]">
            This vendor hasn't added their store details yet. You can still
            reach them on WhatsApp.
          </p>
        )}

        {/* ORDERING FLOW */}
        <section className="mt-6 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--tk-ink)]">
            <Ruler size={15} aria-hidden="true" />
            Ordering with {displayName}
          </h2>

          <ol className="mt-3 space-y-3">
            {[
              {
                title: "Message the vendor",
                body: "Tell them what you want to order and share your style inspiration.",
              },
              {
                title: "Get a private measurement link",
                body: "They send a single-use link that only works for your order.",
              },
              {
                title: "Submit two photos",
                body: "Take a front and side photo. TrendySize calculates your measurements automatically.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--tk-surface)] text-xs font-bold text-[var(--tk-brand)]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[var(--tk-ink)]">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--tk-ink-muted)]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--tk-surface-muted)] px-3 py-2.5 text-xs leading-5 text-[var(--tk-ink-soft)]">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--tk-brand)]" aria-hidden="true" />
            Your photos are used only for this order and are shared only with
            {` ${displayName}`}. Ask them to delete the photos after your order is complete.
          </p>
        </section>

        {/* WHATSAPP CTA */}
        <div className="mt-6">
          {hasWhatsApp ? (
            <a
              href={backendVanityUrl(username)}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white  transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2"
            >
              <FaWhatsapp size={20} aria-hidden="true" />
              Chat on WhatsApp
            </a>
          ) : (
            <p className="rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-4 py-3 text-center text-xs text-[var(--tk-ink-muted)]">
              This vendor hasn't added a WhatsApp number yet.
            </p>
          )}
        </div>

        {/* TRUST STRIP */}
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-4 py-3">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-[var(--tk-brand)]"
              aria-hidden="true"
            />
            <p className="text-xs leading-5 text-[var(--tk-ink-soft)]">
              Your measurements are taken in a private, secure flow and shared
              only with this vendor.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-4 py-3">
            <Ruler
              size={18}
              className="mt-0.5 shrink-0 text-[var(--tk-brand)]"
              aria-hidden="true"
            />
            <p className="text-xs leading-5 text-[var(--tk-ink-soft)]">
              Get accurate measurements in minutes; no tape measure needed.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-5 py-4 text-center">
          <p className="text-xs font-semibold text-[var(--tk-ink)]">
            Powered by TrendySize
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--tk-ink-muted)]">
            Are you a fashion vendor? Create a storefront and send private
            measurement links to your customers.
          </p>
          <Link
            to="/signup"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--tk-brand)] hover:underline"
          >
            Create your storefront
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        </div>
      </main>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center bg-transparent px-5 text-center text-[var(--tk-ink)]">
      <div className="w-full max-w-[380px]">{children}</div>
    </div>
  );
}
