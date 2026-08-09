import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineChevronDown,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlinePhone,
  HiOutlineBellAlert,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineLink,
  HiOutlineShare,
} from "react-icons/hi2";

import {
  FiGrid,
  FiUsers,
  FiScissors,
} from "react-icons/fi";
import { getProfile, logout } from "../services/api";

import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaFacebook,
} from "react-icons/fa";

import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import logoSrc from "../assets/images/nav.png";

const Dashboard = ({
  user = {},
  dashboardData = {},
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  /*
   * ============================================================
   * DATA
   * ============================================================
   *
   * These are intentionally EMPTY by default.
   *
   * The backend can later provide:
   *
   * dashboardData = {
   *   totalCustomers: 128,
   *   measurementsCollected: 342,
   *   totalSubmissions: 342,
   *   activities: [...]
   * }
   *
   * We are NOT hardcoding those numbers here.
   */

  const totalCustomers = dashboardData?.totalCustomers ?? 0;
  const measurementsCollected =
    dashboardData?.measurementsCollected ?? 0;
  const totalSubmissions =
    dashboardData?.totalSubmissions ?? 0;

  const activities = dashboardData?.activities ?? [];

  /*
   * Quick actions should only appear when the user has
   * actual information/data.
   */
  const hasInformation =
    totalCustomers > 0 ||
    measurementsCollected > 0 ||
    totalSubmissions > 0 ||
    activities.length > 0;

  /*
   * User information
   */
  const firstName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    "JOHN";

  const profileName =
    profile?.name ||
    user?.name ||
    "John Doe";

  const fullName = profileName;

  const initials =
    profile?.initials ||
    user?.initials ||
    fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  /*
   * Welcome text changes depending on whether this is
   * the user's first/empty dashboard or an existing dashboard.
   */
  const welcomeTitle = useMemo(() => {
    if (hasInformation) {
      return `Welcome back, ${firstName.toUpperCase()}!`;
    }

    return `Welcome to TrendySize, ${firstName.toUpperCase()}!`;
  }, [hasInformation, firstName]);

  const welcomeDescription = useMemo(() => {
    if (hasInformation) {
      return (
        <>
          Here’s an overview of your business today. Keep sharing your
          measurement link and growing your customer base.
        </>
      );
    }

    return (
      <>
        Your business page is ready. Start by sharing your unique
        measurement links with customers. As they submit their
        measurements, everything will be organized here automatically.
      </>
    );
  }, [hasInformation]);

  /*
   * ============================================================
   * COPY LINK
   * ============================================================
   */

  const handleCopyLink = async () => {
    const measurementLink =
      dashboardData?.measurementLink || "";

    if (!measurementLink) {
      console.log("Measurement link is not available yet.");
      return;
    }

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(measurementLink);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = measurementLink;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand("copy");
        } finally {
          document.body.removeChild(textarea);
        }
      } else {
        console.warn("Clipboard is unavailable in this environment.");
        return;
      }

      console.log("Measurement link copied.");
    } catch (error) {
      console.error("Unable to copy measurement link:", error);
    }
  };

  /*
   * ============================================================
   * SHARE LINK
   * ============================================================
   */

  const handleShareLink = async () => {
    const measurementLink =
      dashboardData?.measurementLink || "";

    if (!measurementLink) {
      console.log("Measurement link is not available yet.");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "TrendySize",
          text: "Take your measurements using my TrendySize link.",
          url: measurementLink,
        });
      } catch {
        console.log("Share cancelled.");
      }
      return;
    }

    await handleCopyLink();
  };

  /*
   * ============================================================
   * QUICK ACTIONS
   * ============================================================
   */

  const handleAddProduct = () => {
    console.log("Add product clicked");
  };

  const handleDeleteCustomer = () => {
    console.log("Delete customer clicked");
  };

  const handleEditCustomer = () => {
    console.log("Edit customer clicked");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn("Logout failed, clearing local session anyway.", error);
    }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("verification_email");
    navigate("/signin");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setDashboardError("");

      try {
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (error) {
        if (error.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          navigate("/signin");
          return;
        }

        setDashboardError(
          error.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside
        className="
          fixed
          left-0
          top-0
          z-50
          hidden
          h-screen
          w-[240px]
          bg-[#EBE9FE]
          border-r
          border-[#6133DA]
          shadow-[8px_0_20px_rgba(36,16,101,0.12)]
          lg:flex
          flex-col
        "
      >

        {/* LOGO */}

        <div className="h-[231px] flex items-center justify-center px-10">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="Trendysize logo"
              className="h-[52px] w-[52px] object-contain drop-shadow-[0_10px_25px_rgba(97,51,218,0.25)]"
            />

            <div className="text-[20px] font-black tracking-[-0.6px] leading-none">
              <span className="text-[#241065]">TRENDY</span>
              <span className="text-[#6133DA]">SIZE</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1">

          {/* Dashboard */}

          <SidebarItem
            icon={<FiGrid size={22} />}
            label="Dashboard"
            active
          />

          {/* Customers */}

          <SidebarItem
            icon={<FiUsers size={22} />}
            label="Customers"
          />

          {/* Measurements */}

          <SidebarItem
            icon={<FiScissors size={22} />}
            label="Measurements"
          />

          {/* Profile */}

          <div className="mt-8">
            <SidebarItem
              icon={<HiOutlineCog size={24} />}
              label="Profile & Settings"
            />
          </div>

          {/* Help */}

          <div className="mt-8">
            <SidebarItem
              icon={<HiOutlineQuestionMarkCircle size={24} />}
              label="Help Center"
            />

            <SidebarItem
              icon={<HiOutlinePhone size={24} />}
              label="Contact Support"
            />

            <SidebarItem
              icon={<HiOutlineBellAlert size={24} />}
              label="Notifications"
            />
          </div>

        </nav>

        {/* LOGOUT */}

        <div className="pb-12">
          <SidebarItem
            icon={
              <HiOutlineArrowLeftOnRectangle
                size={24}
                className="text-[#FF3B30]"
              />
            }
            label="Logout"
            onClick={handleLogout}
          />
        </div>

      </aside>

      {/* ========================================================
          MAIN AREA
      ======================================================== */}

      <main className="lg:ml-[240px] min-h-screen">

        {/* ======================================================
            TOP HEADER
        ====================================================== */}

        <header
          className="
            flex
            h-[120px]
            items-center
            justify-end
            px-6
            sm:px-10
            xl:px-[45px]
          "
        >

          <div className="flex items-center gap-5">

            {/* Notification */}

            <button
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                text-[#6133DA]
              "
              aria-label="Notifications"
            >
              <HiOutlineBell size={32} strokeWidth={1.6} />

              {/* Only display badge when there are notifications */}

              {dashboardData?.notificationCount > 0 && (
                <span
                  className="
                    absolute
                    right-[-2px]
                    top-[-3px]
                    flex
                    h-[20px]
                    min-w-[20px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#6133DA]
                    px-1
                    text-[11px]
                    font-semibold
                    text-white
                  "
                >
                  {dashboardData.notificationCount}
                </span>
              )}
            </button>

            {/* User */}

            <button
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#241065]
                  text-sm
                  font-medium
                  text-white
                "
              >
                {initials}
              </div>

              <span className="hidden text-base font-medium text-[#241065] sm:block">
                {fullName}
              </span>

              <HiOutlineChevronDown
                size={18}
                className="text-[#8D7CFF]"
              />

            </button>

          </div>

        </header>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="px-5 pb-10 sm:px-8 xl:px-[29px]">

          {/* ====================================================
              HERO + SHARE
          ==================================================== */}

          <section
            className="
              grid
              grid-cols-1
              gap-6
              xl:grid-cols-[minmax(0,1fr)_232px]
            "
          >

            {/* HERO CARD */}

            <div
              className="
                relative
                min-h-[260px]
                overflow-hidden
                rounded-[30px]
                bg-[#6133DA]
              "
            >

              {/* Text */}

              <div className="relative z-20 max-w-[560px] px-6 py-8 sm:px-8 sm:py-9">

                <h1
                  className="
                    text-[21px]
                    font-bold
                    leading-[1.2]
                    text-white
                    sm:text-[22px]
                  "
                >
                  {welcomeTitle} 👋
                </h1>

                <p
                  className="
                    mt-4
                    max-w-[510px]
                    text-[13px]
                    leading-[1.35]
                    text-[#BCB5FD]
                  "
                >
                  {welcomeDescription}
                </p>

                {/* HERO BUTTONS */}

                <div className="mt-7 flex flex-wrap gap-4">

                  <button
                    onClick={handleCopyLink}
                    disabled={!dashboardData?.measurementLink}
                    className="
                      flex
                      h-10
                      items-center
                      gap-2
                      rounded-lg
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-[#6133DA]
                      transition
                      hover:bg-[#F4F3FF]
                      disabled:cursor-not-allowed
                      disabled:opacity-70
                    "
                  >
                    <HiOutlineLink size={20} />
                    Copy link
                  </button>

                  <button
                    onClick={handleShareLink}
                    disabled={!dashboardData?.measurementLink}
                    className="
                      flex
                      h-10
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-white
                      px-4
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-white/10
                      disabled:cursor-not-allowed
                      disabled:opacity-70
                    "
                  >
                    <HiOutlineShare size={20} />
                    Share link
                  </button>

                </div>

              </div>

              {/* DASHBOARD HERO IMAGE */}

              <img
                src="/images/dashboard-hero.png"
                alt=""
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  right-[-5px]
                  z-10
                  h-[190px]
                  w-[270px]
                  object-contain
                  object-bottom
                  sm:h-[205px]
                  sm:w-[300px]
                "
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

            </div>

            {/* SOCIAL SHARE CARD */}

            <div
              className="
                rounded-[9px]
                bg-[#EBE9FE]
                px-6
                py-6
              "
            >

              <h3 className="text-[14px] font-semibold text-[#241065]">
                You can share your link on:
              </h3>

              <div className="mt-5 space-y-3">

                <SocialItem
                  icon={
                    <FaWhatsapp
                      className="text-[#25D366]"
                      size={18}
                    />
                  }
                  label="Whatsapp"
                />

                <SocialItem
                  icon={
                    <FaInstagram
                      className="text-[#E4405F]"
                      size={18}
                    />
                  }
                  label="Instagram"
                />

                <SocialItem
                  icon={
                    <FaTiktok
                      className="text-black"
                      size={18}
                    />
                  }
                  label="Tiktok"
                />

                <SocialItem
                  icon={
                    <FaFacebook
                      className="text-[#1877F2]"
                      size={18}
                    />
                  }
                  label="Facebook"
                />

              </div>

            </div>

          </section>

          {/* ====================================================
              STAT CARDS
          ==================================================== */}

          <section
            className="
              mt-[60px]
              grid
              grid-cols-1
              gap-5
              md:grid-cols-3
            "
          >

            <StatCard
              icon={<HiOutlineUserGroup size={24} />}
              iconClass="bg-[#C8C1FF] text-[#6133DA]"
              title="Total Customers"
              value={totalCustomers}
              subtitle={
                totalCustomers > 0
                  ? "Customers in your workspace"
                  : "No customers yet"
              }
            />

            <StatCard
              icon={<FiScissors size={24} />}
              iconClass="bg-[#C8EBD6] text-[#16A34A]"
              title="Measurements collected"
              value={measurementsCollected}
              subtitle={
                measurementsCollected > 0
                  ? "Measurements collected"
                  : "No measurements yet"
              }
            />

            <StatCard
              icon={<FiGrid size={24} />}
              iconClass="bg-[#FFE4A8] text-[#F59E0B]"
              title="Total Submissions"
              value={totalSubmissions}
              subtitle={
                totalSubmissions > 0
                  ? "Measurement submissions"
                  : "No submissions yet"
              }
            />

          </section>

          {/* ====================================================
              BOTTOM SECTION
          ==================================================== */}

          <section
            className="
              mt-[60px]
              grid
              grid-cols-1
              gap-8
              xl:grid-cols-[1.1fr_0.9fr]
            "
          >

            {/* ==================================================
                RECENT ACTIVITIES
            ================================================== */}

            <div>

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-[22px] font-bold text-[#241065]">
                  Recent Activities
                </h2>

                {activities.length > 0 && (
                  <button
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-[#6133DA]
                    "
                  >
                    View all
                    <HiOutlineChevronDown size={16} />
                  </button>
                )}

              </div>

              {/* DATA EXISTS */}

              {activities.length > 0 ? (

                <div className="space-y-2">

                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id || index}
                      activity={activity}
                    />
                  ))}

                </div>

              ) : (

                /* EMPTY STATE */

                <div
                  className="
                    flex
                    min-h-[260px]
                    flex-col
                    items-center
                    justify-center
                    rounded-none
                    bg-[#EBE9FE]
                    px-6
                    text-center
                  "
                >

                  <div
                    className="
                      flex
                      h-[104px]
                      w-[104px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#DCD7FA]
                    "
                  >
                    <HiOutlineClipboardDocumentList
                      size={42}
                      className="text-[#6133DA]"
                    />
                  </div>

                  <h3
                    className="
                      mt-6
                      text-[20px]
                      font-bold
                      text-[#241065]
                    "
                  >
                    Welcome to TrendySize
                  </h3>

                  <p
                    className="
                      mt-3
                      max-w-[430px]
                      text-sm
                      leading-relaxed
                      text-[#6B7280]
                    "
                  >
                    Start by sharing your measurement link with
                    customers. Once customers submit their
                    measurements, their activities will appear here.
                  </p>

                </div>

              )}

            </div>

            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            {hasInformation && (
              <div>

                <h2 className="mb-3 text-[22px] font-bold text-[#241065]">
                  Quick actions
                </h2>

                <div className="space-y-2">

                  <QuickAction
                    label="Add product"
                    icon={<HiOutlinePlus size={20} />}
                    onClick={handleAddProduct}
                    className="
                      border-[#4ADE80]
                      bg-[#EBE9FE]
                    "
                  />

                  <QuickAction
                    label="Delete customer"
                    icon={<HiOutlineTrash size={20} />}
                    onClick={handleDeleteCustomer}
                    className="
                      border-[#FDBA74]
                      bg-[#EBE9FE]
                    "
                  />

                  <QuickAction
                    label="Edit customer"
                    icon={<HiOutlinePencil size={20} />}
                    onClick={handleEditCustomer}
                    className="
                      border-[#4ADE80]
                      bg-[#EBE9FE]
                    "
                  />

                </div>

              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
};


/* ================================================================
   SIDEBAR ITEM
================================================================ */

const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-[64px]
        w-full
        items-center
        gap-4
        px-11
        text-left
        transition
        ${
          active
            ? "bg-[#6133DA] text-white rounded-r-[34px]"
            : "text-[#241065] hover:bg-[#DDD9FE]"
        }
      `}
    >
      <span className="shrink-0">
        {icon}
      </span>

      <span className="text-[16px] font-medium">
        {label}
      </span>
    </button>
  );
};


/* ================================================================
   SOCIAL ITEM
================================================================ */

const SocialItem = ({
  icon,
  label,
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>

      <span className="text-[13px] text-[#241065]">
        {label}
      </span>
    </div>
  );
};


/* ================================================================
   STAT CARD
================================================================ */

const StatCard = ({
  icon,
  iconClass,
  title,
  value,
  subtitle,
}) => {
  return (
    <div
      className="
        min-h-[153px]
        rounded-[12px]
        bg-[#EBE9FE]
        px-6
        py-6
      "
    >

      <div className="flex items-start gap-5">

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <div>

          <h3
            className="
              text-[16px]
              font-semibold
              text-[#241065]
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-3
              text-[34px]
              font-bold
              leading-none
              text-[#241065]
            "
          >
            {value}
          </p>

          <p
            className="
              mt-5
              text-[13px]
              text-[#6B7280]
            "
          >
            {subtitle}
          </p>

        </div>

      </div>

    </div>
  );
};


/* ================================================================
   ACTIVITY ITEM
================================================================ */

const ActivityItem = ({
  activity,
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-[9px]
        bg-[#EBE9FE]
        px-4
        py-3
      "
    >

      <div className="flex items-center gap-4">

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#DCD7FA]
          "
        >
          <HiOutlineClipboardDocumentList
            size={22}
            className="text-[#6133DA]"
          />
        </div>

        <div>

          <p className="text-[15px] font-medium text-[#241065]">
            {activity.title}
          </p>

          {activity.description && (
            <p className="mt-1 text-[12px] text-[#6133DA]">
              {activity.description}
            </p>
          )}

        </div>

      </div>

      {activity.time && (
        <span className="shrink-0 text-[10px] text-[#6133DA]">
          {activity.time}
        </span>
      )}

    </div>
  );
};


/* ================================================================
   QUICK ACTION
================================================================ */

const QuickAction = ({
  label,
  icon,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        h-[50px]
        w-full
        items-center
        justify-center
        gap-2
        rounded-[6px]
        border
        text-[16px]
        font-medium
        text-[#241065]
        transition
        hover:brightness-[0.98]
        ${className}
      `}
    >
      {icon}
      {label}
    </button>
  );
};


export default Dashboard;