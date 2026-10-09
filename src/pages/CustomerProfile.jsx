import { useEffect, useState } from "react";
import {
  Award,
  Check,
  Clock3,
  ExternalLink,
  Mail,
  Phone,
  Ruler,
  Shirt,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  dataUrlToBlob,
  getStoredProducts,
  hydrateProductImages,
  loadProfileMedia,
  readBlobAsDataUrl,
  saveProfileMedia,
} from "../profileMediaStorage";

const EMPTY_PROFILE = {
  businessName: "",
  tagline: "",
  description: "",
  whatsappName: "",
  whatsappNumber: "",
  phone: "",
  email: "",
  portfolioUrl: "",
  profileImage: "",
  coverImage: "",
  happyClients: "",
  outfitsMade: "",
  yearsExperience: "",
};

export default function CustomerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // LOAD PROFILE + PRODUCTS
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
      const savedProfile =
        localStorage.getItem("trendySize_profile");

      const savedProducts =
        localStorage.getItem("trendySize_products");

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);

        const loadedProfile = {
          ...EMPTY_PROFILE,
          ...parsedProfile,
        };
        let migrated = false;

        for (const field of ["profileImage", "coverImage"]) {
          if (loadedProfile[field]?.startsWith("data:")) {
            await saveProfileMedia(
              field,
              dataUrlToBlob(loadedProfile[field])
            );
            migrated = true;
          }

          const storedImage = await loadProfileMedia(field);
          if (storedImage) {
            loadedProfile[field] = await readBlobAsDataUrl(storedImage);
          }
        }

        if (migrated) {
          const storedProfile = { ...loadedProfile };
          ["profileImage", "coverImage"].forEach((field) => {
            storedProfile[field] = "";
          });
          localStorage.setItem(
            "trendySize_profile",
            JSON.stringify(storedProfile)
          );
        }

        setProfile(loadedProfile);
      }

      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);

        if (Array.isArray(parsedProducts)) {
          const {
            products: loadedProducts,
            migrated: productsMigrated,
          } = await hydrateProductImages(parsedProducts);
          if (productsMigrated) {
            localStorage.setItem(
              "trendySize_products",
              JSON.stringify(getStoredProducts(loadedProducts))
            );
          }
          setProducts(loadedProducts);
        } else {
          throw new Error("Saved products must be an array.");
        }
      }
      } catch (error) {
        console.error(
          "Could not load customer profile:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================
  // WHATSAPP
  // ======================================================

  const whatsappNumber =
    profile.whatsappNumber?.replace(/\D/g, "");

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null;

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F3FF]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#D8D6FE] border-t-[#6133DA]" />
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">

      <main className="mx-auto w-full max-w-[1240px] px-6 pb-10 pt-6 lg:px-10 lg:pb-4 lg:pt-3">

        {/* ==================================================
            PROFILE HEADER
        ================================================== */}

        <section>

          {/* COVER */}

          <div className="relative h-[180px] overflow-hidden rounded-t-2xl bg-[#6133DA] lg:h-[145px]">

            {profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-[#241065] via-[#6133DA] to-[#241065]" />
            )}

            {/* VERIFIED */}

            <div className="absolute right-5 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#6133DA] shadow-sm">

              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6133DA] text-white">
                <Check
                  size={11}
                  strokeWidth={3}
                />
              </span>

              Verified Fashion Business

            </div>

          </div>

          {/* PROFILE IMAGE */}

          <div className="relative z-10 -mt-[78px] flex justify-center lg:-mt-[62px]">

            <div className="h-[156px] w-[156px] overflow-hidden rounded-full border-[6px] border-[#F4F3FF] bg-white shadow-lg lg:h-[128px] lg:w-[128px]">

              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={
                    profile.businessName ||
                    "Business profile"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#EBE9FE]" />
              )}

            </div>

          </div>

          {/* BUSINESS INFORMATION */}

          <div className="mx-auto mt-6 max-w-[760px] text-center lg:mt-1">

            {profile.businessName && (
              <div className="flex items-center justify-center gap-2">

                <h1 className="text-[24px] font-bold text-[#241065] lg:text-[27px]">
                  {profile.businessName}
                </h1>

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6133DA] text-white">
                  <Check
                    size={14}
                    strokeWidth={3}
                  />
                </span>

              </div>
            )}

            {profile.tagline && (
              <p className="mt-2 text-[13px] font-semibold text-[#6133DA] lg:mt-1 lg:text-[13px]">
                {profile.tagline}
              </p>
            )}

            {profile.description && (
              <p className="mx-auto mt-4 max-w-[700px] text-[12px] leading-6 text-[#4B5563] lg:mt-2 lg:text-[12px] lg:leading-5">
                {profile.description}
              </p>
            )}

          </div>

        </section>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <section className="mx-auto mt-9 grid max-w-[1080px] grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-4 lg:grid-cols-4 lg:gap-3">

          {/* GET MEASURED */}

          <button
            type="button"
            onClick={() => navigate("/get-measured")}
            className="flex min-h-[76px] items-center gap-4 rounded-xl bg-[#6133DA] px-5 text-left text-white shadow-sm transition hover:bg-[#4D26B5] lg:min-h-[58px] lg:gap-3 lg:px-4"
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Ruler size={21} />
            </div>

            <div>
              <p className="text-[14px] font-bold lg:text-[13px]">
                Get Measured
              </p>

              <p className="mt-1 text-[11px] text-white/70 lg:mt-0.5 lg:text-[10px]">
                Start your measurement
              </p>
            </div>

          </button>

          {/* WHATSAPP */}

          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[76px] items-center gap-4 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-5 transition hover:bg-[#D8D6FE] lg:min-h-[58px] lg:gap-3 lg:px-4"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <FaWhatsapp
                  size={21}
                  className="text-[#25D366]"
                />
              </div>

              <div className="min-w-0">

                <p className="text-[14px] font-bold text-[#241065] lg:text-[13px]">
                  Chat on WhatsApp
                </p>

                <p className="mt-1 truncate text-[11px] text-[#4B5563] lg:mt-0.5 lg:text-[10px]">
                  {profile.whatsappName ||
                    profile.whatsappNumber}
                </p>

              </div>

            </a>
          ) : (
            <div className="flex min-h-[76px] items-center gap-4 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-5 opacity-60 lg:min-h-[58px] lg:gap-3 lg:px-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <FaWhatsapp
                  size={21}
                  className="text-[#25D366]"
                />
              </div>

              <div>
                <p className="text-[14px] font-bold text-[#241065] lg:text-[13px]">
                  WhatsApp
                </p>

                <p className="mt-1 text-[11px] text-[#4B5563] lg:mt-0.5 lg:text-[10px]">
                  Not available
                </p>
              </div>

            </div>
          )}

          {/* PORTFOLIO */}

          {profile.portfolioUrl ? (
            <a
              href={profile.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[76px] items-center gap-4 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-5 transition hover:bg-[#D8D6FE] lg:min-h-[58px] lg:gap-3 lg:px-4"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <ExternalLink
                  size={21}
                  className="text-[#6133DA]"
                />
              </div>

              <div>
                <p className="text-[14px] font-bold text-[#241065] lg:text-[13px]">
                  View Portfolio
                </p>

                <p className="mt-1 text-[11px] text-[#4B5563] lg:mt-0.5 lg:text-[10px]">
                  See our work
                </p>
              </div>

            </a>
          ) : (
            <div className="flex min-h-[76px] items-center gap-4 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-5 opacity-60 lg:min-h-[58px] lg:gap-3 lg:px-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <ExternalLink
                  size={21}
                  className="text-[#6133DA]"
                />
              </div>

              <div>
                <p className="text-[14px] font-bold text-[#241065] lg:text-[13px]">
                  Portfolio
                </p>

                <p className="mt-1 text-[11px] text-[#4B5563] lg:mt-0.5 lg:text-[10px]">
                  Not available
                </p>
              </div>

            </div>
          )}

          {/* CONTACT */}

          {profile.phone ? (
            <a
              href={`tel:${profile.phone}`}
              className="flex min-h-[76px] items-center gap-4 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-5 transition hover:bg-[#D8D6FE] lg:min-h-[58px] lg:gap-3 lg:px-4"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <Phone
                  size={21}
                  className="text-[#6133DA]"
                />
              </div>

              <div>
                <p className="text-[14px] font-bold text-[#241065] lg:text-[13px]">
                  Contact Us
                </p>

                <p className="mt-1 text-[11px] text-[#4B5563] lg:mt-0.5 lg:text-[10px]">
                  Call or email us
                </p>
              </div>

            </a>
          ) : (
            <div className="flex min-h-[76px] items-center gap-4 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-5 opacity-60 lg:min-h-[58px] lg:gap-3 lg:px-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <Phone
                  size={21}
                  className="text-[#6133DA]"
                />
              </div>

              <div>
                <p className="text-[14px] font-bold text-[#241065] lg:text-[13px]">
                  Contact Us
                </p>

                <p className="mt-1 text-[11px] text-[#4B5563] lg:mt-0.5 lg:text-[10px]">
                  Not available
                </p>
              </div>

            </div>
          )}

        </section>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section className="mx-auto mt-8 max-w-[1080px]">

          <div className="grid grid-cols-1 overflow-hidden rounded-xl bg-[#D8D6FE] sm:grid-cols-3">

            <StatCard
              icon={<Award size={24} />}
              value={profile.happyClients}
              label="Happy Clients"
            />

            <StatCard
              icon={<Shirt size={24} />}
              value={profile.outfitsMade}
              label="Outfits Made"
            />

            <StatCard
              icon={<Clock3 size={24} />}
              value={profile.yearsExperience}
              label="Years Experience"
            />

          </div>

        </section>

        {/* ==================================================
            FEATURED WORK
        ================================================== */}

        <section className="mx-auto mt-10 max-w-[1080px]">

          <div className="mb-5">

            <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#241065]">
              Featured Work
            </h2>

            <p className="mt-1 text-[11px] text-[#6133DA]">
              Showcase products
            </p>

          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-[#D8D6FE] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="h-[190px] bg-[#EBE9FE]">

                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name || ""}
                        className="h-full w-full object-cover"
                      />
                    )}

                  </div>

                  {product.name && (
                    <div className="px-4 py-3">

                      <p className="truncate text-[13px] font-semibold text-[#241065]">
                        {product.name}
                      </p>

                    </div>
                  )}

                </div>
              ))}

            </div>
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-[#D8D6FE] bg-[#EBE9FE]">

              <p className="text-[12px] text-[#6B7280]">
                No featured work available.
              </p>

            </div>
          )}

        </section>

        {/* ==================================================
            EMAIL
        ================================================== */}

        {profile.email && (
          <div className="mt-8 flex justify-center">

            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-[11px] text-[#6133DA] transition hover:underline"
            >
              <Mail size={14} />
              {profile.email}
            </a>

          </div>
        )}

      </main>

    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <div className="flex min-h-[86px] items-center justify-center gap-4 border-b border-[#C4C1F2] px-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">

      <div className="shrink-0 text-[#6133DA]">
        {icon}
      </div>

      <div>
        {value && (
          <p className="text-[16px] font-bold text-[#241065]">
            {value}
          </p>
        )}

        <p className="mt-0.5 text-[11px] text-[#4B5563]">
          {label}
        </p>
      </div>

    </div>
  );
}