import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Menu,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/DashboardSidebar";
import drawerLogo from "../assets/images/nav.png";

const guides = [
  {
    title: "Understanding your plan",
    description: "Review your current plan and the features included.",
    steps: [
      "Open the Subscription page to review your active plan.",
      "Check the plan features and expiry date shown with your subscription.",
    ],
    action: "View Subscription",
  },
  {
    title: "Upgrading your plan",
    description: "Compare available plans and choose the right fit for your business.",
    steps: [
      "Open the Subscription page to compare available plans.",
      "Select the plan that best meets your business needs.",
    ],
    action: "View Subscription Options",
  },
];

export default function AccountAndBilling() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openGuide, setOpenGuide] = useState(null);

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">
      <DashboardSidebar
        activeLabel="Help Center"
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-[240px]">
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
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#EAE7FF] text-[#241065] lg:hidden"
            >
              <Menu size={21} strokeWidth={2} />
            </button>
          </div>
        </header>

        <section className="px-4 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-6 lg:px-11 lg:pt-6">
          <div className="w-full max-w-[1120px]">
            <button
              type="button"
              aria-label="Back to Help Center"
              onClick={() => navigate("/help-center")}
              className="mb-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition hover:bg-[#D8D6FE] lg:mb-8"
            >
              <ArrowLeft size={15} />
            </button>

            <div>
              <h1 className="text-[20px] font-bold leading-tight text-[#241065] sm:text-[22px] lg:text-[24px]">
                Account and Billing
              </h1>
              <p className="mt-2 text-[12px] leading-[18px] text-[#4B5563] sm:text-[14px] sm:leading-5 lg:text-[16px]">
                Manage your account, view your plan, upgrade and find billing
                information.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:mt-10 lg:gap-4">
              {guides.map((guide, index) => {
                const isOpen = openGuide === index;
                const panelId = `account-billing-guide-${index}`;

                return (
                  <article
                    key={guide.title}
                    className="overflow-hidden rounded-[20px] border border-[#D1D5DB] bg-[#F4F3FF] transition-shadow hover:shadow-[0_5px_15px_rgba(36,16,101,0.06)] lg:rounded-[24px]"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenGuide(isOpen ? null : index)}
                      className="flex min-h-[80px] w-full items-center justify-between gap-3 px-4 py-4 text-left sm:min-h-[88px] sm:px-5 lg:min-h-[90px] lg:px-6 lg:py-6"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBE9FE] text-[#6133DA]">
                          <Wallet size={22} strokeWidth={1.7} />
                        </span>
                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-[14px] font-semibold leading-5 text-[#3F1E94] sm:text-[16px]">
                            {guide.title}
                          </span>
                          <span className="text-[11px] leading-[17px] text-[#6B7280] sm:text-[12px]">
                            {guide.description}
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-[#6133DA] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        className="border-t border-[#D1D5DB] bg-white/60 px-5 py-4 sm:px-6"
                      >
                        <ol className="list-decimal space-y-2 pl-5 text-[12px] leading-[18px] text-[#4B5563] sm:text-[13px]">
                          {guide.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        <button
                          type="button"
                          onClick={() => navigate("/subscription")}
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
