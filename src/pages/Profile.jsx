import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Images,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Pencil,
  Phone,
  Shirt,
  Sparkles,
  Store,
  Tags,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

import DashboardSidebar from "../components/DashboardSidebar";
import Toast from "../components/Toast";
import {
  DEFAULT_PROFILE,
  MEASUREMENT_LINK_KEY,
  deriveLocationLine,
  deriveWhatsAppLink,
  loadVendorData,
} from "../profileShared";
import { publicProfileLinkFor } from "../services/api";

// A single "at a glance" figure used in the KPI strip and the overview tile.
function StatTile({ icon, value, label, className = "" }) {
  return (
    <div
      className={`tk-tile flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-3 ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-surface-muted)] text-[var(--tk-brand)]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[18px] font-bold leading-none text-[var(--tk-ink)]">
          {value === "" || value === null || value === undefined ? "—" : value}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium text-[var(--tk-ink-muted)]">
          {label}
        </p>
      </div>
    </div>
  );
}

// A compact, labelable fact row used inside the overview tile.
function FactRow({ icon, label, value, emphasize = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-[12px] font-medium text-[var(--tk-ink-muted)]">
        <span className="text-[var(--tk-brand)]">{icon}</span>
        {label}
      </span>
      <span
        className={`min-w-0 truncate text-[12px] font-semibold ${
          emphasize
            ? "text-[var(--tk-ink)]"
            : value
              ? "text-[var(--tk-ink)]"
              : "text-[var(--tk-ink-muted)]"
        }`}
      >
        {value || "Not set"}
      </span>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [products, setProducts] = useState([]);
  const [measurementLink, setMeasurementLink] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const data = await loadVendorData();
      if (cancelled) return;
      setProfile(data.profile);
      setProducts(data.products);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const loadMeasurementLink = () => {
      const savedLink = localStorage.getItem(MEASUREMENT_LINK_KEY);

      if (!savedLink) {
        setMeasurementLink(null);
        return;
      }

      try {
        const parsedLink = JSON.parse(savedLink);
        if (parsedLink?.link && !parsedLink?.used) {
          setMeasurementLink(parsedLink);
        } else {
          localStorage.removeItem(MEASUREMENT_LINK_KEY);
          setMeasurementLink(null);
        }
      } catch (error) {
        console.error("Could not load measurement link:", error);
        localStorage.removeItem(MEASUREMENT_LINK_KEY);
        setMeasurementLink(null);
      }
    };

    loadMeasurementLink();

    const handleStorageChange = (event) => {
      if (event.key === MEASUREMENT_LINK_KEY) loadMeasurementLink();
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadMeasurementLink, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const whatsappLink = deriveWhatsAppLink(profile.whatsappNumber);
  const locationLine = deriveLocationLine(profile);
  const specializationLine = (profile.specialization || "").trim();
  const craftTags = Array.isArray(profile.craftTags) ? profile.craftTags : [];
  const looksCount = products.length;

  const storefrontUrl = profile.username
    ? publicProfileLinkFor(profile.username)
    : "";

  const handleMeasurementLink = () => {
    if (!measurementLink?.link) return;
    window.open(measurementLink.link, "_blank", "noopener,noreferrer");
    localStorage.removeItem(MEASUREMENT_LINK_KEY);
    setMeasurementLink(null);
  };

  const copyStoreLink = async () => {
    if (!storefrontUrl) return;

    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setToast({ message: "Store link copied.", tone: "success" });
    } catch (error) {
      console.error("Copy store link error:", error);
      setToast({
        message: "Couldn't copy the link. Please copy it manually.",
        tone: "error",
      });
    }
  };

  const hasStory =
    Boolean(profile.description?.trim()) ||
    Boolean(profile.tagline?.trim()) ||
    craftTags.length > 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-[var(--tk-ink)]">
      <DashboardSidebar activeLabel="Profile" />

      <main className="relative z-10 ml-0 min-h-screen px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-0 sm:px-6 lg:ml-[240px] lg:px-7 lg:pb-14 lg:pt-0">
        <div className="mx-auto max-w-[1180px]">
          {/* COVER + AVATAR */}
          <section>
            <div className="relative -mx-4 h-[118px] bg-[var(--tk-brand)] sm:-mx-6 sm:h-[150px] lg:-mx-7 lg:h-[180px]">
              <div className="absolute inset-0 overflow-hidden">
                {profile.coverImage ? (
                  <img
                    src={profile.coverImage}
                    alt="Business cover"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full bg-[var(--tk-brand)] bg-gradient-to-b from-white/[0.08] to-black/[0.12]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 lg:left-[120px] lg:translate-x-0">
                <div className="h-[132px] w-[132px] overflow-hidden rounded-full border-[5px] border-[var(--tk-bg)] bg-[var(--tk-surface)] shadow-[0_12px_30px_rgba(36,16,101,0.18)] sm:h-[140px] sm:w-[140px] lg:h-[150px] lg:w-[150px] lg:border-[6px]">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.businessName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-semibold text-[var(--tk-brand)] sm:text-[11px]">
                      Add Business Picture
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* IDENTITY */}
            <div className="mt-[84px] text-center sm:mt-[88px] lg:mt-[96px] lg:pl-[300px] lg:pr-4 lg:text-left">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 lg:justify-start">
                <h1
                  className={`max-w-[80%] truncate text-[19px] font-bold sm:text-[21px] lg:max-w-none lg:text-[24px] ${
                    profile.businessName
                      ? "text-[var(--tk-ink)]"
                      : "text-[var(--tk-ink-muted)]"
                  }`}
                >
                  {profile.businessName || "Add Business Name"}
                </h1>

                {profile.businessName?.trim() && (
                  <span
                    title="Verified Fashion Business"
                    aria-label="Verified Fashion Business"
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tk-brand)] text-[var(--tk-brand-ink)] sm:h-5 sm:w-5"
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] font-medium text-[var(--tk-ink-soft)] sm:text-[13px] lg:justify-start lg:text-[14px]">
                {locationLine && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} aria-hidden="true" />
                    {locationLine}
                  </span>
                )}

                {specializationLine && (
                  <>
                    {locationLine && (
                      <span className="text-[var(--tk-ink-muted)]" aria-hidden="true">
                        •
                      </span>
                    )}
                    <span className="font-semibold text-[var(--tk-brand)]">
                      {specializationLine}
                    </span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* DESKTOP HEADER ACTIONS */}
          <div className="mt-4 hidden justify-end gap-2 lg:flex">
            {measurementLink && (
              <button
                type="button"
                onClick={handleMeasurementLink}
                className="flex items-center gap-2 rounded-lg bg-[var(--tk-brand)] px-3.5 py-2 text-[12px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90"
              >
                <LinkIcon size={15} />
                Measurement link
              </button>
            )}

            {storefrontUrl && (
              <>
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)] px-3.5 py-2 text-[12px] font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)]"
                >
                  <Store size={15} className="text-[var(--tk-brand)]" />
                  View storefront
                </a>

                <button
                  type="button"
                  onClick={copyStoreLink}
                  className="flex items-center gap-2 rounded-lg border border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)] px-3.5 py-2 text-[12px] font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)]"
                >
                  <Copy size={15} className="text-[var(--tk-brand)]" />
                  Copy link
                </button>
              </>
            )}

            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-lg border border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)] px-3.5 py-2 text-[12px] font-semibold text-[var(--tk-brand)] transition hover:bg-[var(--tk-surface)]"
            >
              <Pencil size={15} />
              Edit profile
            </Link>
          </div>

          {/* BENTO OVERVIEW */}
          <section className="mt-5 grid grid-cols-1 gap-4 lg:mt-7 lg:grid-cols-12 lg:gap-5">
            {/* STORY / ABOUT */}
            <div className="tk-tile rounded-2xl p-4 sm:p-5 lg:col-span-7">
              <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[var(--tk-ink)] lg:text-[14px]">
                <Sparkles size={15} className="text-[var(--tk-brand)]" />
                Your story
              </h2>

              {profile.tagline?.trim() ? (
                <p className="mt-3 text-[13px] font-medium italic text-[var(--tk-ink-soft)] sm:text-[14px]">
                  “{profile.tagline}”
                </p>
              ) : null}

              {profile.description?.trim() ? (
                <p className="mt-2 whitespace-pre-line text-[12px] leading-6 text-[var(--tk-ink-muted)] sm:text-[13px]">
                  {profile.description}
                </p>
              ) : null}

              {craftTags.length > 0 && (
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)]">
                    <Tags size={13} />
                    Crafts
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                    {craftTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--tk-border-strong)] bg-[var(--tk-surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--tk-ink)] sm:text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!hasStory && (
                <p className="mt-3 text-[12px] leading-6 text-[var(--tk-ink-muted)]">
                  Add a tagline, description and craft tags so customers
                  understand your signature look.
                </p>
              )}

              <Link
                to="/settings"
                className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--tk-brand)] transition hover:opacity-80"
              >
                <Pencil size={12} />
                Edit your story
              </Link>
            </div>

            {/* AT A GLANCE */}
            <div className="tk-tile rounded-2xl p-4 sm:p-5 lg:col-span-5">
              <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[var(--tk-ink)] lg:text-[14px]">
                <Store size={15} className="text-[var(--tk-brand)]" />
                At a glance
              </h2>

              <div className="mt-2 divide-y divide-[var(--tk-border)]">
                <FactRow
                  icon={<MapPin size={14} />}
                  label="Location"
                  value={locationLine}
                />
                <FactRow
                  icon={<Sparkles size={14} />}
                  label="Specialization"
                  value={specializationLine}
                />
                <FactRow
                  icon={<Shirt size={14} />}
                  label="Outfits made"
                  value={profile.outfitsMade}
                />
                <FactRow
                  icon={<Clock3 size={14} />}
                  label="Experience"
                  value={profile.yearsExperience ? `${profile.yearsExperience} yrs` : ""}
                />
                <FactRow
                  icon={<Images size={14} />}
                  label="Looks in gallery"
                  value={looksCount > 0 ? looksCount : ""}
                />
                <FactRow
                  icon={<LinkIcon size={14} />}
                  label="Store handle"
                  value={profile.username ? `@${profile.username}` : ""}
                />
              </div>
            </div>
          </section>

          {/* KPI STRIP */}
          <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 lg:grid-cols-4 lg:gap-4">
            <StatTile
              icon={<Shirt size={18} />}
              value={profile.outfitsMade}
              label="Outfits Made"
            />
            <StatTile
              icon={<Clock3 size={18} />}
              value={profile.yearsExperience}
              label="Years Experience"
            />
            <StatTile
              icon={<Images size={18} />}
              value={looksCount}
              label="Looks in Gallery"
            />
            <StatTile
              icon={<Tags size={18} />}
              value={craftTags.length}
              label="Craft Tags"
            />
          </section>

          {/* MOBILE ACTIONS */}
          <section className="mt-5 lg:hidden">
            {measurementLink && (
              <button
                type="button"
                onClick={handleMeasurementLink}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--tk-brand)] px-4 text-[13px] font-bold text-[var(--tk-brand-ink)] shadow-sm transition hover:opacity-90"
              >
                <LinkIcon size={18} />
                Measurement link
              </button>
            )}

            <div
              className={`grid gap-2 ${measurementLink ? "mt-2" : ""} grid-cols-3`}
            >
              {storefrontUrl && (
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[var(--tk-surface)] px-1.5 text-center transition hover:bg-[var(--tk-hover)]"
                >
                  <Store size={17} className="text-[var(--tk-brand)]" />
                  <span className="text-[10px] font-semibold text-[var(--tk-ink)]">
                    Storefront
                  </span>
                </a>
              )}

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[var(--tk-surface)] px-1.5 text-center transition hover:bg-[var(--tk-hover)]"
              >
                <FaWhatsapp
                  size={17}
                  className="text-[#25D366]"
                  aria-hidden="true"
                />
                <span className="text-[10px] font-semibold text-[var(--tk-ink)]">
                  WhatsApp
                </span>
              </a>

              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[var(--tk-surface)] px-1.5 text-center transition hover:bg-[var(--tk-hover)]"
                >
                  <ExternalLink size={17} className="text-[var(--tk-brand)]" />
                  <span className="text-[10px] font-semibold text-[var(--tk-ink)]">
                    Portfolio
                  </span>
                </a>
              )}

              <a
                href={profile.phone ? `tel:${profile.phone}` : "#"}
                className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[var(--tk-surface)] px-1.5 text-center transition hover:bg-[var(--tk-hover)]"
              >
                <Phone size={17} className="text-[var(--tk-brand)]" />
                <span className="text-[10px] font-semibold text-[var(--tk-ink)]">
                  Contact
                </span>
              </a>

              {storefrontUrl && (
                <button
                  type="button"
                  onClick={copyStoreLink}
                  className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[var(--tk-surface)] px-1.5 text-center transition hover:bg-[var(--tk-hover)]"
                >
                  <Copy size={17} className="text-[var(--tk-brand)]" />
                  <span className="text-[10px] font-semibold text-[var(--tk-ink)]">
                    Copy
                  </span>
                </button>
              )}

              <Link
                to="/settings"
                className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[var(--tk-surface)] px-1.5 text-center transition hover:bg-[var(--tk-hover)]"
              >
                <Pencil size={17} className="text-[var(--tk-brand)]" />
                <span className="text-[10px] font-semibold text-[var(--tk-ink)]">
                  Edit
                </span>
              </Link>
            </div>
          </section>

          {/* FEATURED WORK */}
          <section className="mt-7 lg:mt-9">
            <div className="mb-3 flex items-end justify-between gap-3 lg:mb-4">
              <div>
                <h2 className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-wide text-[var(--tk-ink)] lg:text-[15px]">
                  <Images size={16} className="text-[var(--tk-brand)]" />
                  Featured Work
                </h2>
                <p className="mt-1 text-[11px] text-[var(--tk-brand)] lg:text-[12px]">
                  {looksCount > 0
                    ? `${looksCount} ${looksCount === 1 ? "look" : "looks"} in your gallery`
                    : "Looks from your atelier"}
                </p>
              </div>

              <Link
                to="/settings"
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--tk-border-strong)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--tk-brand)] transition hover:bg-[var(--tk-surface)] sm:px-3 sm:py-2 sm:text-[12px]"
              >
                <Pencil size={12} />
                Manage
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="tk-tile flex min-h-[160px] flex-col items-center justify-center rounded-xl px-4 text-center sm:min-h-[180px] lg:min-h-[190px]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-surface-muted)] text-[var(--tk-brand)] lg:h-12 lg:w-12">
                  <ImageIcon size={23} />
                </div>

                <h3 className="mt-2.5 text-[13px] font-semibold text-[var(--tk-ink)] lg:mt-3 lg:text-[14px]">
                  No looks yet
                </h3>

                <p className="mt-1 text-[10px] text-[var(--tk-ink-muted)] sm:text-[11px] lg:text-[12px]">
                  Add looks to show customers your craft
                </p>

                <Link
                  to="/settings"
                  className="mt-3 flex items-center gap-1.5 rounded-md bg-[var(--tk-brand)] px-3.5 py-1.5 text-[10px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 lg:px-4 lg:py-2 lg:text-[12px]"
                >
                  Add Look
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="tk-tile group overflow-hidden rounded-xl"
                  >
                    <div className="relative h-[150px] overflow-hidden bg-[var(--tk-surface)] sm:h-[170px] lg:h-[190px]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="p-2.5 lg:p-3">
                      <p className="truncate text-[12px] font-semibold text-[var(--tk-ink)] lg:text-[14px]">
                        {product.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
