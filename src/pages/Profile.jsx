import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Check,
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Pencil,
  Phone,
  Settings as SettingsIcon,
  Shirt,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

import DashboardSidebar from "../components/DashboardSidebar";
import {
  DEFAULT_PROFILE,
  MEASUREMENT_LINK_KEY,
  deriveLocationLine,
  deriveWhatsAppLink,
  loadVendorData,
} from "../profileShared";

function StatCard({ icon, value, label }) {
  return (
    <div className="flex h-[68px] min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-center sm:h-[72px] sm:flex-row sm:gap-2 sm:px-2 sm:text-left lg:gap-3">
      <div className="shrink-0 text-[var(--tk-brand)]">{icon}</div>

      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold text-[var(--tk-ink)] sm:text-[12px] lg:text-[14px]">
          {value === "" || value === null || value === undefined
            ? "—"
            : value}
        </p>

        <p className="truncate text-[9px] text-[var(--tk-ink-muted)] sm:text-[10px] lg:text-[12px]">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [products, setProducts] = useState([]);
  const [measurementLink, setMeasurementLink] = useState(null);

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

  const handleMeasurementLink = () => {
    if (!measurementLink?.link) return;
    window.open(measurementLink.link, "_blank", "noopener,noreferrer");
    localStorage.removeItem(MEASUREMENT_LINK_KEY);
    setMeasurementLink(null);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-[var(--tk-ink)]">
      <DashboardSidebar activeLabel="Profile" />

      <main className="relative z-10 ml-0 min-h-screen px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-0 sm:px-6 lg:ml-[240px] lg:px-7 lg:pb-14 lg:pt-0">
        <div className="mx-auto max-w-[1180px]">
          {/* COVER + PROFILE */}
          <section>
            <div className="relative -mx-4 h-[110px] bg-[var(--tk-brand)] sm:-mx-6 sm:h-[150px] lg:-mx-7 lg:h-[190px]">
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

              {/* PROFILE PICTURE — banner bottom meets the avatar's midpoint */}
              <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                <div className="h-[146px] w-[146px] overflow-hidden rounded-full border-[5px] border-[var(--tk-bg)] bg-[var(--tk-surface)] shadow-[0_12px_30px_rgba(36,16,101,0.18)] sm:h-[125px] sm:w-[125px] lg:h-[160px] lg:w-[160px] lg:border-[6px]">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.businessName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-semibold text-[var(--tk-brand)] sm:text-[11px] lg:text-[12px]">
                      Add Business Picture
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BUSINESS INFORMATION */}
            <div className="relative mx-auto mt-[85px] max-w-[680px] px-2 text-center sm:mt-[75px] lg:mt-[92px] lg:px-0">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <h1
                  className={`max-w-[80%] truncate text-[18px] font-bold sm:text-[20px] lg:max-w-none lg:text-[22px] ${
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

              {/* DESKTOP EDIT BUTTON */}
              <Link
                to="/settings"
                className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] px-2 py-1 text-[12px] font-medium text-[var(--tk-brand)] transition hover:bg-[var(--tk-surface)] lg:flex"
              >
                <Pencil size={10} />
                Edit
              </Link>

              {locationLine && (
                <p className="mt-1.5 flex items-center justify-center gap-1 text-[12px] font-medium text-[var(--tk-ink-soft)] sm:mt-2 sm:text-[13px] lg:text-[14px]">
                  <MapPin size={13} aria-hidden="true" />
                  {locationLine}
                </p>
              )}

              {specializationLine && (
                <p className="mt-1.5 text-[12px] font-semibold text-[var(--tk-brand)] sm:mt-2 sm:text-[13px] lg:text-[14px]">
                  {specializationLine}
                </p>
              )}

              {profile.tagline?.trim() && (
                <p className="mt-1.5 text-[12px] font-medium text-[var(--tk-ink-soft)] sm:mt-2 sm:text-[13px] lg:text-[14px]">
                  {profile.tagline}
                </p>
              )}

              {profile.description?.trim() && (
                <p className="mx-auto mt-2 max-w-[600px] text-[11px] leading-[1.45] text-[var(--tk-ink-muted)] sm:text-[12px] sm:leading-5 lg:mt-3">
                  {profile.description}
                </p>
              )}

              {Array.isArray(profile.craftTags) &&
                profile.craftTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {profile.craftTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--tk-border-strong)] bg-[var(--tk-surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--tk-ink)] sm:text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
            </div>
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
              className={`grid gap-2 ${measurementLink ? "mt-2" : ""} ${
                profile.portfolioUrl ? "grid-cols-4" : "grid-cols-3"
              }`}
            >
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

          {/* DESKTOP ACTIONS */}
          <section className="mt-8 hidden flex-nowrap justify-center gap-4 lg:flex">
            {measurementLink && (
              <button
                type="button"
                onClick={handleMeasurementLink}
                aria-label="Measurement link"
                title="Measurement link"
                className="flex min-h-[68px] w-[210px] shrink-0 items-center justify-start gap-3 rounded-xl border border-[var(--tk-brand)] bg-[var(--tk-brand)] px-4 text-left text-[var(--tk-brand-ink)] transition hover:opacity-90"
              >
                <LinkIcon size={20} />
                <span className="text-[14px] font-bold">Measurement link</span>
              </button>
            )}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="tk-tile flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl px-4"
            >
              <FaWhatsapp
                size={20}
                className="text-[#25D366]"
                aria-hidden="true"
              />
              <div>
                <p className="text-[14px] font-bold text-[var(--tk-ink)]">
                  Chat on WhatsApp
                </p>
                <p className="mt-1 text-[12px] text-[var(--tk-ink-muted)]">
                  {profile.whatsappName || "Add WhatsApp Name"}
                </p>
              </div>
            </a>

            <a
              href={profile.portfolioUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="tk-tile flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl px-4"
            >
              <ExternalLink size={20} className="text-[var(--tk-brand)]" />
              <div>
                <p className="text-[14px] font-bold text-[var(--tk-ink)]">
                  View Portfolio
                </p>
                <p className="mt-1 text-[12px] text-[var(--tk-ink-muted)]">
                  {profile.portfolioUrl ? "See our work" : "Add Portfolio URL"}
                </p>
              </div>
            </a>

            <a
              href={profile.phone ? `tel:${profile.phone}` : "#"}
              className="tk-tile flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl px-4"
            >
              <Phone size={20} className="text-[var(--tk-brand)]" />
              <div>
                <p className="text-[14px] font-bold text-[var(--tk-ink)]">
                  Contact Us
                </p>
                <p className="mt-1 text-[12px] text-[var(--tk-ink-muted)]">
                  {profile.phone ? "Call or email us" : "Add Phone Number"}
                </p>
              </div>
            </a>

            <Link
              to="/settings"
              className="tk-tile flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl px-4 text-left"
            >
              <SettingsIcon size={20} className="text-[var(--tk-brand)]" />
              <div>
                <p className="text-[14px] font-bold text-[var(--tk-ink)]">
                  Settings
                </p>
                <p className="mt-1 text-[12px] text-[var(--tk-ink-muted)]">
                  Update your details
                </p>
              </div>
            </Link>
          </section>

          {/* STATS */}
          <section className="mt-4 sm:mt-5">
            <div className="tk-tile grid grid-cols-2 divide-x divide-[var(--tk-border-strong)] overflow-hidden rounded-xl">
              <StatCard
                icon={<Shirt size={19} />}
                value={profile.outfitsMade}
                label="Outfits Made"
              />
              <StatCard
                icon={<Clock3 size={19} />}
                value={profile.yearsExperience}
                label="Years Experience"
              />
            </div>
          </section>

          {/* FEATURED WORK (READ-ONLY) */}
          <section className="mt-7 lg:mt-9">
            <div className="mb-3 flex items-end justify-between gap-3 lg:mb-4">
              <div>
                <h2 className="text-[14px] font-bold uppercase tracking-wide text-[var(--tk-ink)] lg:text-[15px]">
                  Featured Work
                </h2>
                <p className="mt-1 text-[11px] text-[var(--tk-brand)] lg:text-[12px]">
                  Looks from your atelier
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
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)]"
                  >
                    <div className="relative h-[135px] bg-[var(--tk-surface)] sm:h-[150px] lg:h-[180px]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
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
    </div>
  );
}
