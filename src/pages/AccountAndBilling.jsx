import NotificationBell from "../components/NotificationBell";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/DashboardSidebar";
import BrandLogo from "../components/BrandLogo";

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
            <BrandLogo
              className="h-9 w-9 max-[380px]:h-8 max-[380px]:w-8"
            />
            <span className="-ml-1 text-sm font-extrabold text-[#241065] max-[380px]:text-sm">
              TRENDY<span className="text-[#9B8AFB]">SIZE</span>
            </span>
          </button>

          <div className="flex items-center gap-4">
            <NotificationBell className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#241065] transition hover:bg-[#EBE9FE]" size={19} />
            <span className="hidden text-sm font-medium text-[#241065] sm:inline">
              Help Center
            </span>
          </div>
        </header>

        <section className="px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 lg:px-11 lg:pt-6 lg:pb-14">
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
              <h1 className="text-xl font-bold leading-tight text-[#241065] sm:text-2xl lg:text-2xl">
                Account and Billing
              </h1>
              <p className="mt-2 text-xs leading-[18px] text-[#4B5563] sm:text-sm sm:leading-5 lg:text-base">
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
                    className="overflow-hidden rounded-[20px] border border-[#D1D5DB] bg-[#F4F3FF]   lg:rounded-xl"
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
                          <span className="text-sm font-semibold leading-5 text-[#3F1E94] sm:text-base">
                            {guide.title}
                          </span>
                          <span className="text-xs leading-[17px] text-[#6B7280] sm:text-xs">
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
                        <ol className="list-decimal space-y-2 pl-5 text-xs leading-[18px] text-[#4B5563] sm:text-sm">
                          {guide.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        <button
                          type="button"
                          onClick={() => navigate("/subscription")}
                          className="mt-4 text-xs font-semibold text-[#6133DA] underline decoration-[#C4B5FD] underline-offset-4 transition hover:text-[#4D26B5] sm:text-sm"
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
