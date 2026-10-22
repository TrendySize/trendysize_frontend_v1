import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CircleHelp,
  CreditCard,
  Search,
  Settings2,
  UsersRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/DashboardSidebar";
import BrandLogo from "../components/BrandLogo";

const helpCategories = [
  {
    title: "Getting Started",
    description:
      "Learn how to set up your profile and start collecting customer measurements.",
    icon: CircleHelp,
    topics: [
      {
        title: "Set up your business profile",
        description:
          "Add your business name and contact information in Profile & Settings.",
        path: "/profile",
        action: "Open Profile & Settings",
      },
      {
        title: "Generate a measurement link",
        description:
          "Find your measurement link on the Dashboard and copy it to share.",
        path: "/dashboard",
        action: "Open Dashboard",
      },
      {
        title: "Share your measurement link",
        description:
          "Send your copied link to a customer so they can submit their measurements.",
        path: "/dashboard",
        action: "Open Dashboard",
      },
    ],
  },
  {
    title: "Managing your business",
    description:
      "Manage customer records, review measurements, and update your profile.",
    icon: UsersRound,
    topics: [
      {
        title: "Find a customer",
        description:
          "Search and sort your saved customer records from the Customers page.",
        path: "/customers",
        action: "View Customers",
      },
      {
        title: "Review customer measurements",
        description:
          "Open a customer record to review their profile and measurement history.",
        path: "/customers",
        action: "View Customers",
      },
      {
        title: "Update your business details",
        description:
          "Edit your business information and statistics in Profile & Settings.",
        path: "/profile",
        action: "Open Profile & Settings",
      },
    ],
  },
  {
    title: "Account and Billing",
    description:
      "Get help with your account settings and subscription options.",
    icon: CreditCard,
    topics: [
      {
        title: "Manage your profile",
        description:
          "Update your business profile and contact details from Profile & Settings.",
        path: "/profile",
        action: "Open Profile & Settings",
      },
      {
        title: "View subscription options",
        description:
          "Review the available subscription information on the Subscription page.",
        path: "/subscription",
        action: "View Subscription",
      },
    ],
  },
  {
    title: "Troubleshooting",
    description:
      "Find quick steps for common issues with links and customer records.",
    icon: Settings2,
    topics: [
      {
        title: "I can't find a customer",
        description:
          "Check the Customers page search and clear any entered search text.",
        path: "/customers",
        action: "Open Customers",
      },
      {
        title: "I need a new measurement link",
        description:
          "Visit the Dashboard to view and generate a measurement link.",
        path: "/dashboard",
        action: "Open Dashboard",
      },
      {
        title: "I need more help",
        description:
          "Email the TrendySize support team and include details about the issue.",
        path: "/contact-support",
        action: "Contact Support",
      },
    ],
  },
];

export default function HelpCenter() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return helpCategories;
    }

    return helpCategories.filter((category) =>
      [
        category.title,
        category.description,
        ...category.topics.flatMap((topic) => [
          topic.title,
          topic.description,
          topic.action,
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchTerm]);

  const handleCategoryClick = (category) => {
    if (category.title === "Getting Started") {
      navigate("/help-center/getting-started");
      return;
    }

    if (category.title === "Managing your business") {
      navigate("/help-center/managing-your-business");
      return;
    }

    if (category.title === "Account and Billing") {
      navigate("/help-center/account-and-billing");
      return;
    }

    if (category.title === "Troubleshooting") {
      navigate("/help-center/troubleshooting");
      return;
    }

    setActiveCategory((current) =>
      current === category.title ? null : category.title
    );
  };

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-[#241065]">
      <DashboardSidebar
        activeLabel="Help Center"
      />

      <main className="min-h-screen lg:ml-[240px]">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <header className="flex h-[64px] items-center justify-between border-b border-[#E7E4F5] bg-[#F4F3FF] px-4 sm:px-6 lg:h-[56px] lg:justify-end lg:border-b-0 lg:px-8">
          {/* Mobile Brand */}
          <div className="flex min-w-0 items-center lg:hidden">
            <button
              type="button"
              aria-label="Go to dashboard"
              onClick={() => navigate("/dashboard")}
              className="flex shrink-0 items-center"
            >
              <BrandLogo
                variant="light"
                className="h-9 w-9 max-[380px]:h-8 max-[380px]:w-8"
              />

              <span className="-ml-1 text-[14px] font-extrabold text-[#241065] max-[380px]:text-[13px]">
                TRENDY
                <span className="text-[#9B8AFB]">SIZE</span>
              </span>
            </button>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#241065] transition hover:bg-[#EBE9FE]"
            >
              <Bell size={19} strokeWidth={1.7} />

              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#6133DA]" />
            </button>

            <span className="hidden text-[13px] font-medium text-[#241065] lg:inline">
              Help Center
            </span>

          </div>
        </header>

        {/* =========================================================
            MAIN CONTENT
        ========================================================= */}
        <section className="px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 lg:px-7 lg:pt-5 lg:pb-14">
          <div className="w-full max-w-[1180px]">
            {/* =====================================================
                PAGE INTRO
            ===================================================== */}
            <div className="mb-5 sm:mb-6">
              <h1 className="text-[21px] font-bold leading-[1.2] text-[#241065] sm:text-[23px]">
                Help Center
              </h1>

              <p className="mt-1.5 max-w-[650px] text-[12px] leading-[18px] text-[#6B7280] sm:text-[13px] sm:leading-5">
                Find answers, learn how to get the most out of TrendySize,
                and resolve common issues.
              </p>
            </div>

            {/* =====================================================
                SEARCH
            ===================================================== */}
            <div className="mb-7 max-w-[620px]">
              <label className="flex h-[46px] w-full items-center gap-3 rounded-[12px] border border-[#DDD8F5] bg-white px-3.5 shadow-[0_2px_8px_rgba(36,16,101,0.03)] transition focus-within:border-[#9B8AFB] focus-within:ring-2 focus-within:ring-[#EBE9FE]">
                <Search
                  size={18}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#6133DA]"
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setActiveCategory(null);
                  }}
                  placeholder="Search for help..."
                  aria-label="Search Help Center"
                  className="h-full w-full bg-transparent text-[13px] text-[#241065] outline-none placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
                />

                {searchTerm && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveCategory(null);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F4F3FF] hover:text-[#241065]"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
            </div>

            {/* =====================================================
                CATEGORY HEADING
            ===================================================== */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold text-[#241065] sm:text-[16px]">
                  Browse by category
                </h2>

                <p className="mt-1 text-[11px] leading-4 text-[#7A748A] sm:text-[12px]">
                  Choose a topic to find the help you need.
                </p>
              </div>

              {searchTerm && (
                <span className="rounded-full bg-[#EBE9FE] px-2.5 py-1 text-[10px] font-semibold text-[#6133DA]">
                  {filteredCategories.length}{" "}
                  {filteredCategories.length === 1
                    ? "result"
                    : "results"}
                </span>
              )}
            </div>

            {/* =====================================================
                CATEGORY GRID
            ===================================================== */}
            {filteredCategories.length ? (
              <div className="rounded-[18px] bg-[#EBE9FE] p-3 sm:p-5 lg:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
                  {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.title;

                    const panelId = `help-category-${category.title
                      .toLowerCase()
                      .replaceAll(" ", "-")}`;

                    return (
                      <article
                        key={category.title}
                        className={`overflow-hidden rounded-[14px] border bg-white transition-all duration-200 ${
                          isActive
                            ? "border-[#BDB4F7] shadow-[0_6px_20px_rgba(36,16,101,0.08)]"
                            : "border-[#E1DDF1] shadow-[0_2px_8px_rgba(36,16,101,0.035)] hover:border-[#CFC7F5] hover:shadow-[0_5px_15px_rgba(36,16,101,0.06)]"
                        }`}
                      >
                      {/* =================================================
                          CATEGORY HEADER
                      ================================================= */}
                      <button
                        type="button"
                        aria-expanded={isActive}
                        aria-controls={panelId}
                        onClick={() => handleCategoryClick(category)}
                        className="flex min-h-[76px] w-full items-center gap-2.5 px-3 py-3 text-left sm:min-h-[112px] sm:gap-4 sm:px-5 sm:py-5"
                      >
                        {/* Icon */}
                        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#EBE9FE] text-[#6133DA] sm:h-[44px] sm:w-[44px] sm:rounded-[12px]">
                          <Icon size={19} strokeWidth={1.7} />
                        </span>

                        {/* Text */}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-bold leading-4 text-[#3F1E94] sm:text-[14px] sm:leading-5">
                            {category.title}
                          </span>

                          <span className="mt-0.5 block max-w-[390px] text-[10px] leading-[15px] text-[#6B7280] sm:mt-1 sm:text-[12px] sm:leading-[18px]">
                            {category.description}
                          </span>
                        </span>

                        {/* Arrow */}
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all sm:h-8 sm:w-8 ${
                            isActive
                              ? "bg-[#6133DA] text-white"
                              : "bg-[#F4F3FF] text-[#6133DA]"
                          }`}
                        >
                          <ArrowRight
                            size={15}
                            strokeWidth={2}
                            className={`transition-transform duration-200 ${
                              isActive ? "rotate-90" : ""
                            }`}
                          />
                        </span>
                      </button>

                      {/* =================================================
                          EXPANDED TOPICS
                      ================================================= */}
                      {isActive && (
                        <div
                          id={panelId}
                          className="border-t border-[#E8E4F4] bg-[#FAF9FF] px-4 py-2.5 sm:px-5"
                        >
                          {category.topics.map((topic, index) => (
                            <div
                              key={topic.title}
                              className={`py-3 ${
                                index !== category.topics.length - 1
                                  ? "border-b border-[#E9E5F5]"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Number */}
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBE9FE] text-[10px] font-bold text-[#6133DA]">
                                  {index + 1}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <h3 className="text-[12px] font-semibold leading-5 text-[#3F1E94] sm:text-[13px]">
                                    {topic.title}
                                  </h3>

                                  <p className="mt-0.5 max-w-[600px] text-[10px] leading-[16px] text-[#6B7280] sm:text-[11px] sm:leading-[17px]">
                                    {topic.description}
                                  </p>

                                  {topic.href ? (
                                    <a
                                      href={topic.href}
                                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#6133DA] transition hover:text-[#4D26B5] sm:text-[11px]"
                                    >
                                      {topic.action}
                                      <ArrowRight size={12} />
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => navigate(topic.path)}
                                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#6133DA] transition hover:text-[#4D26B5] sm:text-[11px]"
                                    >
                                      {topic.action}
                                      <ArrowRight size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* =======================================================
                 EMPTY SEARCH STATE
              ======================================================= */
              <div className="rounded-[14px] border border-[#E1DDF1] bg-white px-5 py-10 text-center shadow-[0_2px_8px_rgba(36,16,101,0.035)] sm:py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBE9FE] text-[#6133DA]">
                  <Search size={20} strokeWidth={1.7} />
                </div>

                <h3 className="mt-4 text-[14px] font-bold text-[#241065]">
                  No help topics found
                </h3>

                <p className="mx-auto mt-1.5 max-w-[330px] text-[11px] leading-[17px] text-[#6B7280]">
                  No help topics match “{searchTerm}”. Try searching with
                  another word or phrase.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory(null);
                  }}
                  className="mt-4 rounded-[9px] bg-[#6133DA] px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-[#5128C7]"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* =====================================================
                SUPPORT FOOTER
            ===================================================== */}
            <div className="mt-7 rounded-[14px] border border-[#DDD8F5] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] font-bold text-[#241065] sm:text-[13px]">
                    Still need help?
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-[#6B7280] sm:text-[11px]">
                    Our support team can help you with any TrendySize issue.
                  </p>
                </div>

                <a
                  href="/contact-support"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] bg-[#6133DA] px-4 text-[10px] font-semibold text-white transition hover:bg-[#5128C7] sm:h-10 sm:px-5 sm:text-[11px]"
                >
                  Contact Support
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}