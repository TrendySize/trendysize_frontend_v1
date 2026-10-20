import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  ChevronDown,
  ClipboardList,
  Link,
  Menu,
  Ruler,
  Share2,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

import bannerImage from "../assets/images/hero.png";
import drawerLogo from "../assets/images/nav.png";
import DashboardSidebar from "../components/DashboardSidebar";
import { getProfile, getCustomers, getMeasurements } from "../services/api";

const bannerImageLayers = Array.from({ length: 10 });

const socialItems = [
  { label: "WhatsApp", icon: FaWhatsapp },
  { label: "Instagram", icon: FaInstagram },
  { label: "TikTok", icon: FaTiktok },
  { label: "Facebook", icon: FaFacebookF },
];

const MEASUREMENT_LINK_KEY =
  "trendySize_active_measurement_link";

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]);

  const [user, setUser] = useState(null);

  const [measurementLink, setMeasurementLink] =
    useState(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  // ============================================================
  // LOAD LOGGED-IN USER
  // ============================================================
  useEffect(() => {
    const loadStoredUser = () => {
      const possibleKeys = [
        "trendySize_user",
        "auth_user",
        "user",
      ];

      for (const key of possibleKeys) {
        const savedUser = localStorage.getItem(key);

        if (!savedUser) continue;

        try {
          const parsedUser = JSON.parse(savedUser);

          if (
            parsedUser &&
            typeof parsedUser === "object"
          ) {
            setUser(parsedUser);
            return;
          }
        } catch (error) {
          console.error(
            `Unable to read ${key}:`,
            error
          );
        }
      }

      setUser(null);
    };

    loadStoredUser();

    const handleStorageChange = () => {
      loadStoredUser();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // The .NET backend has no aggregate /dashboard endpoint; compose the
        // dashboard from the real resources (guide §3.5, §4.2, §5.1).
        const [profile, customers, measurements] = await Promise.all([
          getProfile(),
          getCustomers(),
          getMeasurements(),
        ]);

        if (profile) {
          setUser(profile);
          localStorage.setItem("trendySize_user", JSON.stringify(profile));
        }

        const customerList = Array.isArray(customers) ? customers : [];
        const measurementList = Array.isArray(measurements) ? measurements : [];

        setCustomers(customerList);
        setMeasurements(measurementList);

        // `submissions` is a count of completed/submitted measurements.
        setSubmissions(measurementList);

        // Derive a light activity feed from the newest measurements.
        setActivities(
          measurementList.slice(0, 8).map((m) => ({
            id: m.id,
            type: "measurement",
            status: m.status,
            customerName:
              [m.customerFirstName, m.customerLastName].filter(Boolean).join(" ") ||
              "A customer",
            createdAt: m.createdAt,
          }))
        );
      } catch (error) {
        console.error("Unable to load dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  // ============================================================
  // LOAD ACTIVE MEASUREMENT LINK
  // ============================================================
  useEffect(() => {
    const loadMeasurementLink = () => {
      const savedLink =
        localStorage.getItem(
          MEASUREMENT_LINK_KEY
        );

      if (!savedLink) {
        setMeasurementLink(null);
        return;
      }

      try {
        const parsedLink =
          JSON.parse(savedLink);

        if (
          parsedLink?.link &&
          !parsedLink?.used
        ) {
          setMeasurementLink(parsedLink);
        } else {
          localStorage.removeItem(
            MEASUREMENT_LINK_KEY
          );

          setMeasurementLink(null);
        }
      } catch (error) {
        console.error(
          "Unable to load measurement link:",
          error
        );

        localStorage.removeItem(
          MEASUREMENT_LINK_KEY
        );

        setMeasurementLink(null);
      }
    };

    loadMeasurementLink();

    const handleStorageChange = (event) => {
      if (
        event.key === MEASUREMENT_LINK_KEY
      ) {
        loadMeasurementLink();
      }

      if (
        event.key === "trendySize_user" ||
        event.key === "auth_user" ||
        event.key === "user"
      ) {
        const possibleKeys = [
          "trendySize_user",
          "auth_user",
          "user",
        ];

        for (const key of possibleKeys) {
          const savedUser =
            localStorage.getItem(key);

          if (!savedUser) continue;

          try {
            const parsedUser =
              JSON.parse(savedUser);

            if (
              parsedUser &&
              typeof parsedUser === "object"
            ) {
              setUser(parsedUser);
              break;
            }
          } catch (error) {
            console.error(
              "Unable to load stored user:",
              error
            );
          }
        }
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    const interval = setInterval(
      loadMeasurementLink,
      500
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // CLOSE MOBILE DRAWER WHEN RESIZING TO DESKTOP
  // ============================================================
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // ============================================================
  // PREVENT BODY SCROLL WHEN MOBILE DRAWER IS OPEN
  // ============================================================
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // ============================================================
  // USER NAME
  // ============================================================
  const userName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "";

  const firstName =
    userName.trim().split(" ")[0] || "";

  const userInitial =
    userName.trim().charAt(0).toUpperCase();

  // ============================================================
  // TOTALS
  // ============================================================
  const totals = useMemo(
    () => [
      customers.length,
      measurements.length,
      submissions.length,
    ],
    [
      customers.length,
      measurements.length,
      submissions.length,
    ]
  );

  // ============================================================
  // GENERATE LINK
  // ============================================================
  const handleGenerateLink = () => {
    window.location.href =
      "/subscription";
  };

  // ============================================================
  // COPY LINK
  // ============================================================
  const copyMeasurementLink = async () => {
    if (!measurementLink?.link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        measurementLink.link
      );
    } catch (error) {
      console.error(
        "Unable to copy measurement link:",
        error
      );
    }
  };

  // ============================================================
  // SHARE LINK
  // ============================================================
  const shareMeasurementLink = async () => {
    if (!measurementLink?.link) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            "TrendySize Measurement Link",
          text:
            "Please use this link to enter your measurements.",
          url: measurementLink.link,
        });
      } else {
        await navigator.clipboard.writeText(
          measurementLink.link
        );
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(
          "Unable to share measurement link:",
          error
        );
      }
    }
  };

  // ============================================================
  // OPEN MEASUREMENT LINK
  // ============================================================
  const openMeasurementLink = () => {
    if (!measurementLink?.link) {
      return;
    }

    window.open(
      measurementLink.link,
      "_blank",
      "noopener,noreferrer"
    );

    localStorage.removeItem(
      MEASUREMENT_LINK_KEY
    );

    setMeasurementLink(null);
  };

  // ============================================================
  // MOBILE NAVIGATION
  // ============================================================
  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">

      {/* =====================================================
          DESKTOP SIDEBAR
          DO NOT CHANGE
      ===================================================== */}
      <DashboardSidebar
        activeLabel="Dashboard"
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="min-h-screen bg-[#F4F3FF] lg:ml-[240px]">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <header
          className="
            flex
            h-[88px]
            items-center
            justify-end
            px-[28px]

            max-lg:h-[68px]
            max-lg:justify-between
            max-lg:px-[16px]
          "
        >

          {/* MOBILE BRAND */}
          <button
            type="button"
            aria-label="Go to dashboard"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="hidden items-center gap-0 max-lg:flex"
          >
            <img
              src={drawerLogo}
              alt=""
              className="h-9 w-9 object-contain max-[380px]:h-8 max-[380px]:w-8"
            />
            <span className="-ml-1 text-[14px] font-extrabold text-[#241065] max-[380px]:text-[13px]">
              TRENDY<span className="text-[#9B8AFB]">SIZE</span>
            </span>
          </button>

          <div className="flex items-center gap-[4px]">
            <div className="flex items-center gap-[14px] max-lg:gap-[4px]">

            {/* NOTIFICATION */}
            <button
              type="button"
              aria-label="Notifications"
              className="
                flex
                h-[34px]
                w-[34px]
                items-center
                justify-center

                max-lg:h-[36px]
                max-lg:w-[36px]
              "
            >
              <Bell
                size={21}
                strokeWidth={1.5}
                className="
                  text-[#6133DA]

                  max-lg:size-[22px]
                "
              />
            </button>

            {/* USER */}
            <div className="flex items-center gap-[9px] max-lg:gap-[4px]">

              {userName ? (
                <>
                  <div
                    className="
                      flex
                      h-[34px]
                      w-[34px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#241065]
                      text-[12px]
                      text-[#9B8CF9]

                      max-lg:h-[38px]
                      max-lg:w-[38px]
                      max-lg:text-[14px]
                    "
                  >
                    {userInitial}
                  </div>

                  <span
                    className="
                      max-w-[100px]
                      truncate
                      text-[11px]
                      text-[#241065]

                      max-lg:hidden
                    "
                  >
                    {userName}
                  </span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/signin";
                  }}
                  className="
                    text-[13px]
                    font-semibold
                    text-[#6133DA]
                    transition
                    hover:text-[#4D26B5]
                    hover:underline
                  "
                >
                  Sign in
                </button>
              )}

              <ChevronDown
                size={15}
                strokeWidth={1.5}
                className="
                  text-[#9B8CF9]
                  max-lg:hidden

                "
              />

            </div>
            </div>

            {/* MOBILE MENU */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() =>
                setMobileSidebarOpen(true)
              }
              className="
                hidden

                max-lg:flex
                max-lg:h-[40px]
                max-lg:w-[40px]
                max-lg:items-center
                max-lg:justify-center
                max-lg:rounded-[10px]
                max-lg:bg-[#EAE7FF]
              "
            >
              <Menu
                size={21}
                strokeWidth={2}
                className="text-[#241065]"
              />
            </button>
          </div>
        </header>

        {/* =====================================================
            HERO + SOCIAL
        ===================================================== */}
        <section
          className="
            px-[28px]

            max-lg:px-[16px]
          "
        >

          <div
            className="
              grid
              w-full
              max-w-[1140px]
              grid-cols-1
              gap-[94px]
              xl:grid-cols-[721px_231px]

              max-lg:gap-[14px]
            "
          >

            {/* HERO */}
            <div
              className="
                relative
                isolate
                h-[210px]
                w-full
                overflow-hidden
                rounded-[22px]
                bg-[#6133DA]

                max-lg:h-[250px]
                max-lg:rounded-[16px]
                max-[360px]:!h-[270px]
              "
            >

              {/* HERO IMAGE */}
              <div
                className="
                  pointer-events-none
                  absolute
                  right-[8px]
                  top-0
                  z-10
                  h-[275px]
                  w-[185px]

                  max-lg:right-[4px]
                  max-lg:top-auto
                  max-lg:bottom-0
                  max-lg:translate-y-[48px]
                  max-lg:h-[242px]
                  max-lg:w-[154px]
                  max-[360px]:!h-[196px]
                  max-[360px]:!w-[124px]
                "
              >
                {bannerImageLayers.map(
                  (_, index) => (
                    <img
                      key={index}
                      src={bannerImage}
                      alt={
                        index === 0
                          ? "Fashion illustration"
                          : ""
                      }
                      aria-hidden={
                        index !== 0
                      }
                      className={
                        index === 0
                          ? "h-full w-full object-contain max-lg:object-bottom"
                          : "absolute inset-0 h-full w-full object-contain max-lg:object-bottom"
                      }
                    />
                  )
                )}
              </div>

              {/* HERO CONTENT */}
              <div
                className="
                  absolute
                  left-[22px]
                  top-0
                  z-20
                  h-full
                  w-[430px]

                  max-lg:left-[20px]
                  max-lg:w-[calc(100%-40px)]
                "
              >

                {/* TITLE */}
                <h1
                  className="
                    absolute
                    left-0
                    top-[28px]
                    w-[330px]
                    text-[17px]
                    font-bold
                    leading-[21px]
                    text-[#F4F3FF]

                    max-lg:top-[30px]
                    max-lg:w-full
                    max-lg:text-[19px]
                    max-[360px]:!text-[10px]
                    max-lg:leading-[24px]
                  "
                >
                  Welcome to TrendySize
                  {firstName
                    ? `, ${firstName}!`
                    : "!"}
                </h1>

                {/* SPARKLE */}
                <Sparkles
                  size={19}
                  strokeWidth={1.5}
                  className="
                    absolute
                    left-[278px]
                    top-[28px]
                    text-[#BCB5FD]

                    max-lg:hidden
                  "
                />

                {/* DESCRIPTION */}
                <p
                  className="
                    absolute
                    left-0
                    top-[62px]
                    w-[390px]
                    text-[11px]
                    font-medium
                    leading-[14px]
                    text-[#BCB5FD]

                    max-lg:top-[68px]
                    max-lg:w-full
                    max-lg:text-[10px]
                    max-lg:leading-[14px]
                  "
                >
                  <span className="max-lg:hidden">
                    Your business page is ready.
                    Start by sharing your unique
                    measurement links with customers.
                    As they submit their measurements,
                    everything will be organized here
                    automatically.
                  </span>

                  <span className="hidden max-lg:block">
                    Your business page is ready.
                    Start by sharing
                    <br />
                    your unique measurement links
                    with customers.
                    <br />
                    As they submit their measurements,
                    everything
                    <br />
                    will be organized here
                    automatically.
                  </span>
                </p>

                {/* GENERATE / LINK ACTIONS */}
                {!measurementLink ? (
                  <button
                    type="button"
                    onClick={
                      handleGenerateLink
                    }
                    className="
                      absolute
                      bottom-[22px]
                      left-0
                      z-30
                      flex
                      h-[40px]
                      items-center
                      gap-[7px]
                      rounded-[7px]
                      border
                      border-[#E5E1FF]
                      bg-[#F4F3FF]
                      px-[12px]
                      transition-all
                      duration-200
                      hover:-translate-y-[1px]
                      hover:scale-[1.04]
                      hover:border-[#B9A9FF]
                      hover:bg-[#F1EDFF]
                      hover:shadow-[0_12px_24px_rgba(97,51,218,0.18)]

                      max-lg:bottom-[33px]
                      max-lg:left-[6px]
                      max-lg:h-[35px]
                      max-lg:gap-[5px]
                      max-lg:rounded-[18px]
                      max-lg:px-[11px]
                    "
                  >
                    <Share2
                      size={17}
                      strokeWidth={1.5}
                      className="
                        text-[#7A5DF5]

                        max-lg:size-[14px]
                      "
                    />

                    <span
                      className="
                        text-[11px]
                        font-medium
                        text-[#7A5DF5]

                        max-lg:text-[10px]
                      "
                    >
                      Generate link
                    </span>
                  </button>
                ) : (
                  <div
                    className="
                      absolute
                      bottom-[22px]
                      left-0
                      z-30
                      flex
                      items-center
                      gap-[6px]

                      max-lg:bottom-[33px]
                      max-lg:gap-[4px]
                    "
                  >

                    {/* COPY */}
                    <button
                      type="button"
                      onClick={
                        copyMeasurementLink
                      }
                      className="
                        flex
                        h-[40px]
                        items-center
                        gap-[6px]
                        rounded-[7px]
                        border
                        border-[#E5E1FF]
                        bg-[#F4F3FF]
                        px-[11px]

                        max-lg:h-[33px]
                        max-lg:gap-[4px]
                        max-lg:rounded-[7px]
                        max-lg:px-[7px]
                      "
                    >
                      <ClipboardList
                        size={16}
                        strokeWidth={1.5}
                        className="
                          text-[#7A5DF5]

                          max-lg:size-[13px]
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          font-medium
                          text-[#7A5DF5]

                          max-lg:text-[8px]
                        "
                      >
                        Copy Link
                      </span>
                    </button>

                    {/* SHARE */}
                    <button
                      type="button"
                      onClick={
                        shareMeasurementLink
                      }
                      className="
                        flex
                        h-[40px]
                        items-center
                        gap-[6px]
                        rounded-[7px]
                        border
                        border-white/60
                        bg-[#6133DA]
                        px-[11px]
                        text-[#F4F3FF]

                        max-lg:h-[33px]
                        max-lg:gap-[4px]
                        max-lg:rounded-[7px]
                        max-lg:px-[7px]
                      "
                    >
                      <Share2
                        size={16}
                        strokeWidth={1.5}
                        className="
                          text-[#F4F3FF]

                          max-lg:size-[13px]
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          font-medium
                          text-[#F4F3FF]

                          max-lg:text-[8px]
                        "
                      >
                        Share Link
                      </span>
                    </button>

                    {/* OPEN */}
                    <button
                      type="button"
                      onClick={
                        openMeasurementLink
                      }
                      className="
                        flex
                        h-[40px]
                        w-[40px]
                        items-center
                        justify-center
                        rounded-[9px]
                        border
                        border-white/60
                        bg-[#6133DA]
                        text-[#EDE9FF]

                        max-lg:h-[33px]
                        max-lg:w-[33px]
                        max-lg:rounded-[7px]
                      "
                      aria-label="Open measurement link"
                    >
                      <Link
                        size={17}
                        strokeWidth={1.9}
                        className="
                          text-[#EDE9FF]

                          max-lg:size-[14px]
                        "
                      />
                    </button>

                  </div>
                )}

              </div>
            </div>

            {/* SOCIAL */}
            <div
              className="
                h-[170px]
                w-[231px]
                rounded-[8px]
                bg-[#EBE9FE]
                p-[18px]
                xl:mt-[32px]

                max-lg:h-auto
                max-lg:w-full
                max-lg:rounded-[14px]
                max-lg:p-[14px]
              "
            >
              <h2
                className="
                  text-[11px]
                  font-semibold
                  text-[#241065]

                  max-lg:text-[13px]
                  max-lg:leading-[18px]
                "
              >
                You can share your link on:
              </h2>

              <div
                className="
                  mt-[17px]
                  flex
                  flex-col
                  gap-[10px]

                  max-lg:mt-[10px]
                  max-lg:grid
                  max-lg:grid-cols-2
                  max-lg:gap-[7px]
                "
              >
                {socialItems.map(
                  ({ label, icon: Icon }) => (
                    <a
                      key={label}
                      href={
                        measurementLink?.link
                          ? measurementLink.link
                          : `#${label.toLowerCase()}`
                      }
                      onClick={(event) => {
                        if (
                          !measurementLink?.link
                        ) {
                          return;
                        }

                        event.preventDefault();

                        if (
                          label === "WhatsApp"
                        ) {
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(
                              measurementLink.link
                            )}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        } else if (
                          label === "Facebook"
                        ) {
                          window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                              measurementLink.link
                            )}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        } else {
                          copyMeasurementLink();
                        }
                      }}
                      className="
                        flex
                        items-center
                        gap-[10px]

                        max-lg:h-[42px]
                        max-lg:rounded-[8px]
                        max-lg:bg-white/60
                        max-lg:px-[9px]
                      "
                    >
                      <span
                        className="
                          flex
                          items-center
                          justify-center

                          max-lg:h-[28px]
                          max-lg:w-[28px]
                          max-lg:shrink-0
                          max-lg:rounded-full
                          max-lg:bg-white
                        "
                      >
                        <Icon
                          size={13}
                          className={
                            label === "WhatsApp"
                              ? "text-[#25D366] max-lg:size-[17px]"
                              : label === "Facebook"
                                ? "text-[#0866FF] max-lg:size-[17px]"
                                : "text-[#241065] max-lg:size-[17px]"
                          }
                        />
                      </span>

                      <span
                        className="
                          text-[10px]
                          font-medium
                          text-[#1F2937]

                          max-lg:text-[11px]
                        "
                      >
                        {label}
                      </span>
                    </a>
                  )
                )}
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            STATISTICS
        ===================================================== */}
        <section
          className="
            mt-[20px]
            px-[28px]

            max-lg:mt-[14px]
            max-lg:px-[16px]
          "
        >
          <div
            className="
              grid
              w-full
              max-w-[1140px]
              grid-cols-1
              gap-[20px]
              md:grid-cols-3

              max-lg:grid-cols-2
              max-lg:gap-[10px]
            "
          >

            {/* CUSTOMERS */}
            <div
              className="
                flex
                h-[145px]
                w-full
                items-center
                gap-[12px]
                rounded-[11px]
                bg-[#EBE9FE]
                px-[14px]

                max-lg:h-[128px]
                max-lg:gap-[9px]
                max-lg:rounded-[12px]
                max-lg:px-[12px]
              "
            >
              <div
                className="
                  flex
                  h-[36px]
                  w-[36px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#BCB5FD]

                  max-lg:h-[38px]
                  max-lg:w-[38px]
                "
              >
                <UsersRound
                  size={19}
                  strokeWidth={1.5}
                  className="text-[#241065]"
                />
              </div>

              <div className="min-w-0 flex-1 self-center overflow-hidden">
                <div className="flex flex-col justify-center gap-[4px]">
                  <h2
                    className="
                      overflow-hidden
                      text-ellipsis
                      text-[12px]
                      font-medium
                      text-[#241065]

                      max-lg:text-[11px]
                      max-lg:leading-[16px]
                    "
                  >
                    Total Customers
                  </h2>

                  <strong
                    className="
                      block
                      text-[27px]
                      font-bold
                      leading-none
                      text-[#241065]

                      max-lg:text-[22px]
                    "
                  >
                    {totals[0]}
                  </strong>

                  <span
                    className="
                      block
                      truncate
                      whitespace-nowrap
                      text-[9px]
                      font-medium
                      text-[#6B7280]

                      max-lg:text-[8px]
                    "
                  >
                    {totals[0]
                      ? "Updated from your workspace"
                      : "No customers yet"}
                  </span>
                </div>
              </div>
            </div>

            {/* MEASUREMENTS */}
            <div
              className="
                flex
                h-[145px]
                w-full
                items-center
                gap-[12px]
                rounded-[11px]
                bg-[#EBE9FE]
                px-[14px]

                max-lg:h-[128px]
                max-lg:gap-[9px]
                max-lg:rounded-[12px]
                max-lg:px-[12px]
              "
            >
              <div
                className="
                  flex
                  h-[36px]
                  w-[36px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#C6DACD]

                  max-lg:h-[38px]
                  max-lg:w-[38px]
                "
              >
                <Ruler
                  size={19}
                  strokeWidth={1.5}
                  className="text-[#16A34A]"
                />
              </div>

              <div className="min-w-0 flex-1 self-center overflow-hidden">
                <div className="flex flex-col justify-center gap-[4px]">
                  <h2
                    className="
                      overflow-hidden
                      text-ellipsis
                      whitespace-nowrap
                      text-[12px]
                      font-medium
                      text-[#241065]

                      max-lg:text-[11px]
                    "
                  >
                    Measurements collected
                  </h2>

                  <strong
                    className="
                      block
                      text-[27px]
                      font-bold
                      leading-none
                      text-[#241065]

                      max-lg:text-[22px]
                    "
                  >
                    {totals[1]}
                  </strong>

                  <span
                    className="
                      block
                      truncate
                      whitespace-nowrap
                      text-[9px]
                      font-medium
                      text-[#6B7280]

                      max-lg:text-[8px]
                    "
                  >
                    {totals[1]
                      ? "Updated from your workspace"
                      : "No measurements yet"}
                  </span>
                </div>
              </div>
            </div>

            {/* SUBMISSIONS */}
            <div
              className="
                flex
                h-[145px]
                w-full
                items-center
                gap-[12px]
                rounded-[11px]
                bg-[#EBE9FE]
                px-[14px]

                max-lg:col-span-2
                max-lg:h-[100px]
                max-lg:rounded-[12px]
                max-lg:px-[12px]
                max-lg:gap-[9px]
              "
            >
              <div
                className="
                  flex
                  h-[36px]
                  w-[36px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EFDBB9]

                  max-lg:h-[38px]
                  max-lg:w-[38px]
                "
              >
                <ClipboardList
                  size={19}
                  strokeWidth={1.5}
                  className="text-[#F59E0B]"
                />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    text-[12px]
                    font-medium
                    text-[#241065]

                    max-lg:text-[11px]
                  "
                >
                  Total Submissions
                </h2>

                <strong
                  className="
                    mt-[10px]
                    block
                    text-[27px]
                    font-bold
                    leading-none
                    text-[#241065]

                    max-lg:mt-[5px]
                    max-lg:text-[22px]
                  "
                >
                  {totals[2]}
                </strong>

                <span
                  className="
                    mt-[8px]
                    block
                    truncate
                    text-[9px]
                    font-medium
                    text-[#6B7280]

                    max-lg:mt-[5px]
                    max-lg:text-[8px]
                  "
                >
                  {totals[2]
                    ? "Updated from your workspace"
                    : "No submissions yet"}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            RECENT ACTIVITIES
        ===================================================== */}
        <section
          className="
            mt-[16px]
            px-[28px]
            pb-[32px]

            max-lg:mt-[14px]
            max-lg:px-[16px]
            max-lg:pb-[18px]
          "
        >
          <div
            className="
              w-full
              max-w-[1140px]
              overflow-hidden
              rounded-[8px]
              bg-[#EBE9FE]

              max-lg:min-h-[220px]
              max-lg:rounded-[12px]
            "
          >

            {activities.length > 0 ? (
              <div
                className="
                  flex
                  h-[240px]
                  items-center
                  justify-center

                  max-lg:h-[220px]
                "
              >
                <p
                  className="
                    text-[11px]
                    text-[#6B7280]

                    max-lg:text-[11px]
                  "
                >
                  {activities.length} recent
                  activities
                </p>
              </div>
            ) : (
              <div
                className="
                  flex
                  h-[240px]
                  flex-col
                  items-center

                  max-lg:h-[220px]
                "
              >

                <h2
                  className="
                    pt-[18px]
                    text-[12px]
                    font-medium
                    text-[#241065]

                    max-lg:pt-[16px]
                    max-lg:text-[14px]
                  "
                >
                  Recent Activities
                </h2>

                <div
                  className="
                    mt-[13px]
                    flex
                    h-[64px]
                    w-[64px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#D8D5F6]

                    max-lg:mt-[14px]
                    max-lg:h-[52px]
                    max-lg:w-[52px]
                  "
                >
                  <ClipboardList
                    size={28}
                    strokeWidth={2}
                    className="
                      text-[#6133DA]

                      max-lg:size-[24px]
                    "
                  />
                </div>

                <h3
                  className="
                    mt-[10px]
                    text-[15px]
                    font-bold
                    text-[#241065]

                    max-lg:mt-[9px]
                    max-lg:text-[14px]
                  "
                >
                  No activity yet
                </h3>

                <p
                  className="
                    mt-[4px]
                    max-w-[350px]
                    text-center
                    text-[9px]
                    font-medium
                    leading-[12px]
                    text-[#6B7280]

                    max-lg:mt-[5px]
                    max-lg:max-w-[250px]
                    max-lg:text-[9px]
                    max-lg:leading-[14px]
                  "
                >
                  Once customers start submitting
                  their measurements, you'll see
                  their activities here.
                </p>

              </div>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}