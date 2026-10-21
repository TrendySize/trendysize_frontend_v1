import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  LayoutDashboard,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/DashboardSidebar";
import drawerLogo from "../assets/images/nav.png";

const guides = [
  {
    title: "Customer info",
    description:
      "Edit and manage customer information and contact details.",
    icon: UserRound,
    steps: [
      "Open Customers from the sidebar.",
      "Search for a customer or select a customer record from the list.",
      "Use the customer details page to review or update their information.",
    ],
    path: "/customers",
    action: "View Customers",
  },
  {
    title: "Measurement History",
    description:
      "Review a customer’s submitted measurements and measurement history.",
    icon: UsersRound,
    steps: [
      "Go to Customers and open the customer whose measurements you want to review.",
      "Review the measurements saved on the customer details page.",
      "Use the latest measurement record when preparing a new outfit.",
    ],
    path: "/customers",
    action: "View Customers",
  },
  {
    title: "Dashboard",
    description:
      "Understand your dashboard and access your business overview.",
    icon: LayoutDashboard,
    steps: [
      "Open Dashboard from the sidebar.",
      "Review your customer and measurement summaries and recent activity.",
      "Use the measurement link section to copy and share your active link.",
    ],
    path: "/dashboard",
    action: "Open Dashboard",
  },
];

export default function ManagingYourBusiness() {
  const navigate = useNavigate();
  const [openGuide, setOpenGuide] = useState(null);

  return (
    <div className="relative min-h-screen bg-transparent text-[var(--tk-ink)]">
      <DashboardSidebar
        activeLabel="Help Center"
      />

      <main className="relative z-10 min-h-screen lg:ml-[240px]">
        <header className="flex h-[88px] items-center justify-between px-4 sm:px-6 lg:h-[56px] lg:justify-end lg:px-8">
          <button
            type="button"
            aria-label="Go to dashboard"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-0 lg:hidden"
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

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#241065] transition hover:bg-[#EBE9FE]"
            >
              <Bell size={19} strokeWidth={1.7} />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#6133DA]" />
            </button>
            <span className="hidden text-[14px] font-medium text-[#241065] sm:inline">
              Help Center
            </span>
          </div>
        </header>

        <section className="px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 lg:px-7 lg:pt-0 lg:pb-14">
          <div className="max-w-[1180px]">
            <button
              type="button"
              aria-label="Back to Help Center"
              onClick={() => navigate("/help-center")}
              className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition hover:bg-[#D8D6FE] lg:relative lg:-top-6 lg:mb-4"
            >
              <ArrowLeft size={15} />
            </button>

            <div className="mb-7 sm:mb-8 lg:-mt-6 lg:mb-7">
              <h1 className="text-[18px] font-bold leading-tight text-[#241065] sm:text-[20px] lg:text-[22px]">
                Managing your Business
              </h1>
              <p className="mt-1.5 max-w-[650px] text-[12px] leading-[18px] text-[#4B5563] sm:text-[13px] lg:text-[14px]">
                Learn how to manage your customer records, review measurement
                history, and keep business information up to date.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              {guides.map((guide, index) => {
                const Icon = guide.icon;
                const isOpen = openGuide === index;
                const panelId = `business-guide-${index}`;

                return (
                  <article
                    key={guide.title}
                    className="overflow-hidden rounded-xl border border-[#E1DDF1] bg-white shadow-[0_2px_8px_rgba(36,16,101,0.035)] transition-shadow hover:shadow-[0_5px_15px_rgba(36,16,101,0.06)]"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenGuide(isOpen ? null : index)}
                      className="flex min-h-[88px] w-full items-center justify-between gap-3 px-4 py-4 text-left sm:min-h-[92px] sm:px-5"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBE9FE] text-[#6133DA]">
                          <Icon size={18} strokeWidth={1.7} />
                        </span>
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="text-[13px] font-semibold leading-5 text-[#3F1E94] sm:text-[14px]">
                            {guide.title}
                          </span>
                          <span className="text-[11px] leading-[17px] text-[#6B7280] sm:text-[12px]">
                            {guide.description}
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#6133DA] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        className="border-t border-[#E8E4F4] bg-[#FAF9FF] px-4 py-4 sm:px-5 sm:pl-[68px]"
                      >
                        <ol className="list-decimal space-y-2 pl-4 text-[12px] leading-[18px] text-[#4B5563] sm:text-[13px]">
                          {guide.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        <button
                          type="button"
                          onClick={() => navigate(guide.path)}
                          className="mt-4 text-[12px] font-semibold text-[#6133DA] underline decoration-[#C4B5FD] underline-offset-4 transition hover:text-[#4D26B5] sm:text-[13px]"
                        >
                          {guide.action}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
