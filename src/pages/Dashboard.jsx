import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import {
  Bell,
  ChevronDown,
  ClipboardList,
  MailCheck,
  Ruler,
  Share2,
  Sparkles,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

import bannerImage from "../assets/images/hero.png";
import BrandLogo from "../components/BrandLogo";
import DashboardSidebar from "../components/DashboardSidebar";
import Toast from "../components/Toast";
import GenerateLinkModal from "../components/GenerateLinkModal";
import { getProfile, getCustomers, getMeasurements, publicProfileLinkFor, whatsappDirectLinkFor, resendConfirmation, getEmailStatus } from "../services/api";

const bannerImageLayers = Array.from({ length: 10 });

const socialItems = [
  { label: "WhatsApp", icon: FaWhatsapp },
  { label: "Instagram", icon: FaInstagram },
  { label: "TikTok", icon: FaTiktok },
  { label: "Facebook", icon: FaFacebookF },
];

function relativeTime(value) {
  if (!value) return "";

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Animate an integer from 0 → value on mount (and whenever `value` changes).
// Skips straight to the target when the user prefers reduced motion.
function useCountUp(value, { duration = 900, enabled = true } = {}) {
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!enabled || shouldReduceMotion) return;

    const target = Number(value) || 0;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration, enabled, shouldReduceMotion]);

  // Reduced motion (or disabled) → render the final value immediately.
  if (!enabled || shouldReduceMotion) return Number(value) || 0;

  return display;
}

// Lightweight SVG sparkline — no chart dependency. Draws a smooth-ish area
// line for a small series of daily counts and animates its draw on mount.
function Sparkline({ points, stroke = "#6133DA", fill = "rgba(97,51,218,0.14)", height = 44 }) {
  const shouldReduceMotion = useReducedMotion();
  const width = 220;

  if (!points || points.length < 2) return null;

  const max = Math.max(...points, 1);
  const stepX = width / (points.length - 1);

  const coords = points.map((value, index) => {
    const x = index * stepX;
    const y = height - (value / max) * (height - 6) - 3;
    return [x, y];
  });

  const line = coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Measurement activity over the last ${points.length} days`}
      className="overflow-visible"
    >
      <motion.path
        d={area}
        fill={fill}
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// Shared entrance variant for the KPI cards + list rows.
const statCardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// Staggered container used to sequence a group of motion children.
const listStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]);

  const [user, setUser] = useState(null);

  const [avatarFailed, setAvatarFailed] = useState(false);

  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null); // { message, tone }

  const [linkModalOpen, setLinkModalOpen] = useState(false);

  // The unconfirmed-email notice can be dismissed for the session.
  const [emailNoticeDismissed, setEmailNoticeDismissed] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  // What the server says about its ability to send mail: { enabled, healthy }. Null means "not
  // known yet", which is treated as "mail works".
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getEmailStatus()
      .then((status) => {
        if (!cancelled) setEmailStatus(status);
      })
      .catch(() => {
        // Optional endpoint; the API reports its own error if it cannot send.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // With no mail transport there is no confirmation link to send, so the notice would be telling
  // the user to do something impossible. It is hidden instead.
  const mailAvailable = emailStatus?.enabled !== false;

  // Re-sends the confirmation link for an account that was created while email delivery was
  // failing, so the owner can finally confirm their address.
  const handleResendConfirmation = async () => {
    if (!user?.email) return;

    try {
      setResendingConfirmation(true);
      const data = await resendConfirmation(user.email);
      setToast({
        message:
          data.message ||
          "We've sent you a new confirmation link. Check your inbox.",
        tone: "success",
      });
    } catch (err) {
      console.error("Resend confirmation error:", err);
      setToast({
        message:
          err.message ||
          "Unable to send the confirmation email right now.",
        tone: "error",
      });
    } finally {
      setResendingConfirmation(false);
    }
  };

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

        // Derive the activity feed from the newest measurements. The guide's
        // measurement object carries a status, orderReference and timestamps,
        // so surface all of it rather than a bare count (guide §5.1).
        setActivities(
          measurementList.slice(0, 8).map((m) => ({
            id: m.id,
            type: "measurement",
            status: m.status,
            orderReference: m.orderReference || "",
            customerName:
              [m.customerFirstName, m.customerLastName].filter(Boolean).join(" ") ||
              "A customer",
            createdAt: m.analysedAt || m.createdAt,
          }))
        );
      } catch (error) {
        console.error("Unable to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

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

  const profileImage =
    user?.profileImageUrl ||
    user?.profileImage ||
    user?.avatarUrl ||
    "";

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
  // MEASUREMENT INSIGHTS (guide §5.1)
  // Each measurement carries a status string (Pending | Submitted |
  // NeedsManualReview), an orderReference, the customer name, a confidence
  // and UTC timestamps. Surface all of it instead of a raw count.
  // ============================================================
  const measurementStats = useMemo(() => {
    const base = {
      pending: 0,
      submitted: 0,
      needsReview: 0,
      withPhotos: 0,
      latestAt: null,
      trend: [],
    };

    for (const m of measurements) {
      const status = String(m?.status || "").toLowerCase();

      if (status === "pending") base.pending += 1;
      else if (status === "needsmanualreview") base.needsReview += 1;
      else if (status === "submitted" || status === "completed")
        base.submitted += 1;

      if (m?.frontImageUrl || m?.sideImageUrl) base.withPhotos += 1;

      const stamp = m?.analysedAt || m?.createdAt;
      if (stamp) {
        const time = new Date(stamp).getTime();
        if (!Number.isNaN(time) && time > (base.latestAt || 0)) {
          base.latestAt = time;
        }
      }
    }

    base.total = base.pending + base.submitted + base.needsReview;

    // Build a 7-day activity series (oldest → newest) from createdAt stamps.
    const days = 7;
    const dayMs = 24 * 60 * 60 * 1000;
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const buckets = Array.from({ length: days }, () => 0);

    for (const m of measurements) {
      const stamp = m?.analysedAt || m?.createdAt;
      if (!stamp) continue;
      const time = new Date(stamp).getTime();
      if (Number.isNaN(time)) continue;

      const startOfStamp = new Date(
        new Date(time).getFullYear(),
        new Date(time).getMonth(),
        new Date(time).getDate()
      ).getTime();

      const index = days - 1 - Math.round((todayStart - startOfStamp) / dayMs);
      if (index >= 0 && index < days) buckets[index] += 1;
    }

    base.trend = buckets;
    base.trendDelta =
      base.trend.length > 1
        ? base.trend[base.trend.length - 1] - base.trend[base.trend.length - 2]
        : 0;

    return base;
  }, [measurements]);

  // Vendor identity from /auth/me (guide §3.5): the lower-cased handle drives
  // the public WhatsApp vanity link, and whatsappNumber is the raw number.
  const vendorUsername = user?.username || "";
  const vendorWhatsapp = user?.whatsappNumber || "";

  // The vendor's PUBLIC profile page in our app (/v/{username}). Every shared
  // customer link points here so visitors always land on our result page
  // (which forwards active vendors to WhatsApp and shows a friendly card when
  // the vendor is inactive / not found). We never share the raw backend URL.
  const publicProfileLink = vendorUsername
    ? publicProfileLinkFor(vendorUsername)
    : "";

  // The vendor's DIRECT WhatsApp chat link (wa.me/<number>). Used by the
  // "Copy WhatsApp link" action and the preview link so vendors can paste a
  // link that opens their chat straight away.
  const whatsappDirectLink = whatsappDirectLinkFor(vendorWhatsapp);

  const vanityWhatsappLink = whatsappDirectLink || publicProfileLink;

  // ============================================================
  // LIVELY DASHBOARD — animated figures (respects reduced motion)
  // ============================================================
  const shouldReduceMotion = useReducedMotion();
  const loaded = !loading;

  const animatedCustomerCount = useCountUp(totals[0], {
    enabled: loaded,
  });
  const animatedMeasurementCount = useCountUp(totals[1], {
    enabled: loaded,
  });
  const animatedNeedsReview = useCountUp(
    measurementStats.needsReview,
    { enabled: loaded }
  );

  // ============================================================
  // GENERATE LINK
  // ============================================================
  // Generation needs a customer, so the Dashboard opens the shared
  // GenerateLinkModal with a customer picker (guide §5).
  const handleGenerateLink = () => {
    setLinkModalOpen(true);
  };

  // ============================================================
  // SHARE VENDOR LINK (guide §6.1)
  // One canonical link: the public profile page /v/{username}. It routes
  // visitors through our result page (which forwards active vendors to
  // WhatsApp and shows a friendly card for inactive / not-found vendors).
  // ============================================================

  // Copy the vendor's public profile (store handle) link.
  const copyProfileLink = async () => {
    if (!publicProfileLink) return;

    try {
      await navigator.clipboard.writeText(publicProfileLink);
      setToast({ message: "Profile link copied to clipboard.", tone: "success" });
    } catch (error) {
      console.error("Unable to copy profile link:", error);
      setToast({ message: "Couldn't copy the link. Please copy it manually.", tone: "error" });
    }
  };

  // WhatsApp CTA — copies the vendor's DIRECT WhatsApp chat link (wa.me),
  // so it opens their chat straight away when tapped or pasted.
  const copyWhatsappLink = async () => {
    if (!whatsappDirectLink) {
      setToast({
        message: "Add your WhatsApp number in Settings to copy a chat link.",
        tone: "error",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(whatsappDirectLink);
      setToast({ message: "WhatsApp link copied to clipboard.", tone: "success" });
    } catch (error) {
      console.error("Unable to copy WhatsApp link:", error);
      setToast({ message: "Couldn't copy the WhatsApp link. Please copy it manually.", tone: "error" });
    }
  };

  // Share the public profile link on a social platform.
  const shareProfileOn = (label) => {
    const shareUrl = publicProfileLink;
    if (!shareUrl) return;

    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(
      "Message us on WhatsApp to place your order."
    );

    const intents = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      Instagram: `https://www.instagram.com/`,
      TikTok: `https://www.tiktok.com/`,
      X: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    };

    const target = intents[label];

    if (target) {
      const opened = window.open(target, "_blank", "noopener,noreferrer");
      if (!opened) {
        setToast({
          message: "Your browser blocked the pop-up. Please allow pop-ups and try again.",
          tone: "error",
        });
      }
    } else {
      copyProfileLink();
    }
  };

  // ============================================================
  // MOBILE NAVIGATION
  // ============================================================
  return (
    <div className="relative min-h-screen bg-transparent text-[var(--tk-ink)]">

      {/* =====================================================
          DESKTOP SIDEBAR
          DO NOT CHANGE
      ===================================================== */}
      <DashboardSidebar
        activeLabel="Dashboard"
      />

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="relative z-10 min-h-screen bg-transparent pb-[calc(88px+env(safe-area-inset-bottom))] lg:ml-[240px] lg:pb-0">

        {/* =====================================================
            UNCONFIRMED EMAIL NOTICE
            An account created while email delivery was failing can sign in but
            was never confirmed, so the owner never received their link.
        ===================================================== */}
        {user?.emailConfirmed === false &&
          mailAvailable &&
          !emailNoticeDismissed && (
            <div className="mx-[16px] mt-[12px] flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FEF9C3] px-4 py-3 lg:mx-[28px]">
              <MailCheck
                size={18}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[#B45309]"
              />
              <p className="flex-1 text-[13px] leading-5 text-[#78350F]">
                Your email address isn&apos;t confirmed yet. Check your inbox
                for the confirmation link, or{" "}
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingConfirmation}
                  className="font-semibold underline underline-offset-2 disabled:opacity-60"
                >
                  {resendingConfirmation
                    ? "sending…"
                    : "send me a new link"}
                </button>
                .
              </p>
              <button
                type="button"
                onClick={() =>
                  setEmailNoticeDismissed(true)
                }
                aria-label="Dismiss notice"
                className="shrink-0 text-[#92400E] transition hover:text-[#78350F]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

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
            <BrandLogo
              className="h-9 w-9 max-[380px]:h-8 max-[380px]:w-8"
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
                <RouterLink
                  to="/profile"
                  aria-label="Open profile and settings"
                  title="Profile & Settings"
                  className="
                    flex
                    items-center
                    gap-[9px]
                    rounded-full
                    py-[3px]
                    pl-[3px]
                    pr-1
                    transition-colors
                    hover:bg-[#EBE9FE]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#6133DA]/50

                    max-lg:gap-[4px]
                    max-lg:pr-0
                  "
                >
                  <div
                    className="
                      flex
                      h-[34px]
                      w-[34px]
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      bg-[#241065]
                      text-[12px]
                      text-[#9B8CF9]

                      max-lg:h-[38px]
                      max-lg:w-[38px]
                      max-lg:text-[14px]
                    "
                  >
                    {profileImage && !avatarFailed ? (
                      <img
                        src={profileImage}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover"
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      userInitial
                    )}
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

                  <ChevronDown
                    size={15}
                    strokeWidth={1.5}
                    className="
                      text-[#9B8CF9]
                      max-lg:hidden
                    "
                  />
                </RouterLink>
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

            </div>
            </div>
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
                theme-fixed-brand
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
                    Share your WhatsApp business
                    link so customers can message
                    you, then create a personal
                    measurement link for each
                    customer. Results appear here
                    automatically.
                  </span>

                  <span className="hidden max-lg:block">
                    Your business page is ready.
                    Share your WhatsApp business
                    <br />
                    link so customers can message
                    you, then create
                    <br />
                    a personal measurement link
                    for each customer.
                    <br />
                    Results appear here automatically.
                  </span>
                </p>

                {/* PRIMARY CTA — creates a per-customer measurement link
                    (guide §5). Generation needs a customer, so route to the
                    Customers page rather than generating here. */}
                <button
                  type="button"
                  onClick={handleGenerateLink}
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
                    Create customer link
                  </span>
                </button>

              </div>
            </div>

            {/* SOCIAL */}
            <div
              className="
                flex
                min-h-[170px]
                w-[231px]
                flex-col
                rounded-[8px]
                bg-[#EBE9FE]
                p-[18px]
                xl:mt-[32px]

                max-lg:min-h-0
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
                Share your store link
              </h2>

              <p className="mt-[4px] text-[9px] font-medium leading-[13px] text-[var(--tk-ink-muted)] max-lg:text-[10px] max-lg:leading-[15px]">
                Share your public profile, or copy your direct WhatsApp link.
              </p>

              {vendorUsername && (
                <div className="mt-[10px] flex items-center justify-between gap-[8px] rounded-[8px] bg-[var(--tk-bg-elevated)] px-[10px] py-[7px]">
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium uppercase tracking-wide text-[var(--tk-ink-muted)]">
                      Your store handle
                    </p>
                    <p className="truncate text-[11px] font-semibold text-[var(--tk-brand)]">
                      @{vendorUsername}
                    </p>
                    <p className="mt-[1px] truncate text-[9px] font-medium text-[var(--tk-ink-muted)]">
                      Public profile link
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyProfileLink}
                    disabled={!publicProfileLink}
                    className="shrink-0 rounded-[6px] border border-[var(--tk-border)] bg-[var(--tk-surface)] px-[7px] py-[4px] text-[9px] font-semibold text-[var(--tk-ink)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Copy your public profile link"
                  >
                    Copy
                  </button>
                </div>
              )}

              <div
                className="
                  mt-[14px]
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
                  ({ label, icon: Icon }) => {
                    const isWhatsApp = label === "WhatsApp";
                    const enabled = isWhatsApp
                      ? Boolean(whatsappDirectLink)
                      : Boolean(publicProfileLink);

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          isWhatsApp ? copyWhatsappLink() : shareProfileOn(label)
                        }
                        disabled={!enabled}
                        className="
                          flex
                          items-center
                          gap-[10px]
                          text-left
                          disabled:cursor-not-allowed
                          disabled:opacity-50

                          max-lg:h-[42px]
                          max-lg:rounded-[8px]
                          max-lg:bg-[var(--tk-bg-elevated)]
                          max-lg:px-[9px]

                          max-lg:hover:opacity-90
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
                            max-lg:bg-[var(--tk-surface)]
                          "
                        >
                          <Icon
                            size={13}
                            className={
                              isWhatsApp
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
                            text-[var(--tk-ink)]

                            max-lg:text-[11px]
                          "
                        >
                          {isWhatsApp ? "Copy WhatsApp link" : label}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {vendorWhatsapp && vanityWhatsappLink && (
                <a
                  href={vanityWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center gap-[8px] pt-[12px] text-[10px] font-semibold text-[#16A34A] hover:underline max-lg:pt-[10px] max-lg:text-[11px]"
                >
                  <FaWhatsapp size={13} aria-hidden="true" />
                  Preview how customers reach you
                </a>
              )}
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
          <motion.div
            variants={listStagger}
            initial="hidden"
            animate="show"
            className="
              grid
              w-full
              max-w-[1140px]
              grid-cols-1
              gap-[20px]
              md:grid-cols-3

              max-lg:gap-[10px]
            "
          >

            {/* CUSTOMERS */}
            <motion.div
              variants={statCardVariants}
              className="
                tk-tile
                flex
                h-[145px]
                w-full
                items-center
                gap-[12px]
                rounded-[11px]
                px-[14px]

                max-lg:h-[96px]
                max-lg:gap-[11px]
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
                    {animatedCustomerCount}
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
            </motion.div>

            {/* MEASUREMENTS */}
            <motion.div
              variants={statCardVariants}
              className="
                tk-tile
                flex
                h-[145px]
                w-full
                items-center
                gap-[12px]
                rounded-[11px]
                px-[14px]

                max-lg:h-[96px]
                max-lg:gap-[11px]
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
                    {animatedMeasurementCount}
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
                      ? `${measurementStats.submitted} submitted · ${measurementStats.pending} pending`
                      : "No measurements yet"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* NEEDS REVIEW */}
            <motion.div
              variants={statCardVariants}
              className="
                tk-tile
                relative
                flex
                h-[145px]
                w-full
                items-center
                gap-[12px]
                rounded-[11px]
                px-[14px]

                max-lg:h-[96px]
                max-lg:rounded-[12px]
                max-lg:px-[14px]
                max-lg:gap-[11px]
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
                  Needs review
                </h2>

                <strong
                  className="
                    mt-[10px]
                    flex
                    items-center
                    gap-[6px]
                    text-[27px]
                    font-bold
                    leading-none
                    text-[#241065]

                    max-lg:mt-[5px]
                    max-lg:text-[22px]
                  "
                >
                  {animatedNeedsReview}
                  {measurementStats.needsReview > 0 && (
                    <span className="relative flex h-[8px] w-[8px]">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F59E0B] opacity-70 motion-reduce:hidden" />
                      <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-[#F59E0B]" />
                    </span>
                  )}
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
                  {measurementStats.needsReview
                    ? "Photos need a manual check"
                    : "Nothing needs review"}
                </span>
              </div>
            </motion.div>

          </motion.div>

          {/* STATUS BREAKDOWN + TREND (guide §5.1) */}
          {measurements.length > 0 && (
            <div className="mt-[14px] w-full max-w-[1140px] rounded-[11px] bg-[#EBE9FE] px-[16px] py-[14px] max-lg:rounded-[12px]">
              <div className="flex flex-wrap items-center justify-between gap-[10px]">
                <p className="text-[12px] font-semibold text-[#241065]">
                  Status breakdown
                </p>
                <div className="flex flex-wrap items-center gap-[12px] text-[11px] font-medium">
                  <span className="flex items-center gap-[6px] text-[#4C2BB0]">
                    <span className="h-[8px] w-[8px] rounded-full bg-[#7C5CFA]" />
                    {measurementStats.pending} pending
                  </span>
                  <span className="flex items-center gap-[6px] text-[#166534]">
                    <span className="h-[8px] w-[8px] rounded-full bg-[#22C55E]" />
                    {measurementStats.submitted} submitted
                  </span>
                  {measurementStats.needsReview > 0 && (
                    <span className="flex items-center gap-[6px] text-[#B45309]">
                      <span className="h-[8px] w-[8px] rounded-full bg-[#F59E0B]" />
                      {measurementStats.needsReview} needs review
                    </span>
                  )}
                  {measurementStats.latestAt && (
                    <span className="text-[#6B7280]">
                      Last activity {relativeTime(measurementStats.latestAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Proportional bar — animates its segments on mount. */}
              <div
                className="mt-[10px] flex h-[10px] w-full overflow-hidden rounded-full bg-[#Dedafb]"
                role="img"
                aria-label={`${measurementStats.pending} pending, ${measurementStats.submitted} submitted, ${measurementStats.needsReview} needs review`}
              >
                {measurementStats.total > 0 && (
                  <>
                    <motion.span
                      className="h-full bg-[#7C5CFA]"
                      initial={{ width: shouldReduceMotion ? `${(measurementStats.pending / measurementStats.total) * 100}%` : 0 }}
                      animate={{ width: `${(measurementStats.pending / measurementStats.total) * 100}%` }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
                    />
                    <motion.span
                      className="h-full bg-[#22C55E]"
                      initial={{ width: shouldReduceMotion ? `${(measurementStats.submitted / measurementStats.total) * 100}%` : 0 }}
                      animate={{ width: `${(measurementStats.submitted / measurementStats.total) * 100}%` }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.1 }}
                    />
                    <motion.span
                      className="h-full bg-[#F59E0B]"
                      initial={{ width: shouldReduceMotion ? `${(measurementStats.needsReview / measurementStats.total) * 100}%` : 0 }}
                      animate={{ width: `${(measurementStats.needsReview / measurementStats.total) * 100}%` }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.2 }}
                    />
                  </>
                )}
              </div>

              {/* 7-day activity sparkline (custom SVG, no dependency). */}
              {measurementStats.trend.some((n) => n > 0) && (
                <div className="mt-[12px]">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-[6px] text-[11px] font-medium text-[#6B7280]">
                      <TrendingUp size={13} strokeWidth={2} className="text-[#7C5CFA]" />
                      Last 7 days
                    </p>
                    <span
                      className={`text-[11px] font-semibold ${
                        measurementStats.trendDelta >= 0
                          ? "text-[#16A34A]"
                          : "text-[#DC2626]"
                      }`}
                    >
                      {measurementStats.trendDelta >= 0 ? "+" : ""}
                      {measurementStats.trendDelta} vs yesterday
                    </span>
                  </div>
                  <div className="mt-[6px]">
                    <Sparkline points={measurementStats.trend} height={44} />
                  </div>
                </div>
              )}
            </div>
          )}

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

            {loading ? (
              <div className="p-[16px]" aria-busy="true" aria-live="polite">
                <h2 className="mb-[12px] text-[12px] font-semibold text-[#241065] max-lg:text-[14px]">
                  Recent Activities
                </h2>
                <ul className="flex flex-col gap-[8px]">
                  {[0, 1, 2, 3].map((row) => (
                    <li
                      key={row}
                      className="flex items-center gap-[10px] rounded-[10px] bg-[var(--tk-bg-elevated)] px-[12px] py-[10px]"
                    >
                      <span className="h-[32px] w-[32px] shrink-0 animate-pulse rounded-full bg-[#BCB5FD] motion-reduce:animate-none" />
                      <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                        <span className="h-[9px] w-[45%] animate-pulse rounded bg-[#Dedafb] motion-reduce:animate-none" />
                        <span className="h-[8px] w-[30%] animate-pulse rounded bg-[#E5E1FF] motion-reduce:animate-none" />
                      </div>
                      <span className="h-[16px] w-[58px] shrink-0 animate-pulse rounded-full bg-[#E5E1FF] motion-reduce:animate-none" />
                    </li>
                  ))}
                </ul>
                <span className="sr-only">Loading recent activities</span>
              </div>
            ) : activities.length > 0 ? (
              <div className="max-h-[240px] overflow-y-auto p-[16px] max-lg:max-h-none">
                <h2 className="mb-[12px] text-[12px] font-semibold text-[#241065] max-lg:text-[14px]">
                  Recent Activities
                </h2>

                <motion.ul
                  className="flex flex-col gap-[8px]"
                  variants={listStagger}
                  initial="hidden"
                  animate="show"
                >
                  {activities.map((activity) => {
                    const status = String(activity.status || "").toLowerCase();
                    const badge =
                      status === "needsmanualreview"
                        ? { label: "Needs review", cls: "bg-[#FDE8D7] text-[#B45309]" }
                        : status === "submitted" || status === "completed"
                          ? { label: "Submitted", cls: "bg-[#DCFCE7] text-[#166534]" }
                          : { label: "Pending", cls: "bg-[#E5E7EB] text-[#374151]" };

                    return (
                      <motion.li
                        key={activity.id}
                        variants={statCardVariants}
                        whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                        className="flex items-center gap-[10px] rounded-[10px] bg-[var(--tk-bg-elevated)] px-[12px] py-[10px] transition-colors hover:bg-[#F4F3FF] dark:hover:bg-[#211b3a]"
                      >
                        <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#EBE9FE] text-[12px] font-bold text-[#6133DA]">
                          {activity.customerName.charAt(0).toUpperCase()}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-[#241065]">
                            {activity.customerName}
                          </p>
                          <p className="truncate text-[10px] text-[#6B7280]">
                            {activity.orderReference
                              ? `${activity.orderReference} · `
                              : ""}
                            {relativeTime(activity.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-[8px] py-[3px] text-[9px] font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </motion.li>
                    );
                  })}
                </motion.ul>
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

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />

      <GenerateLinkModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        customers={customers}
      />
    </div>
  );
}