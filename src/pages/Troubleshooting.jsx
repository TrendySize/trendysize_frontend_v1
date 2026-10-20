import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/DashboardSidebar";
import drawerLogo from "../assets/images/nav.png";

const faqs = [
  {
    title: "My customer can’t open their measurement link",
    answer:
      "Check that you shared the complete active link. If it still won’t open, create a fresh measurement link from your Dashboard and send it again.",
    path: "/dashboard",
    action: "Open Dashboard",
  },
  {
    title: "Why has my customer's measurement link expired?",
    answer:
      "Create a fresh measurement link from your Dashboard and share it with your customer.",
    path: "/dashboard",
    action: "Get a new link",
  },
  {
    title: "My customer's measurements weren't submitted successfully",
    answer:
      "Ask your customer to reopen the link and complete the measurement steps. Then check Customers to see whether their submission appears.",
    path: "/customers",
    action: "Open Customers",
  },
  {
    title: "Why can't I generate another measurement link?",
    answer:
      "Check your current plan and subscription status. If your subscription is active and you still can’t generate a link, contact support.",
    path: "/subscription",
    action: "View Subscription",
  },
];

export default function Troubleshooting() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">
      <DashboardSidebar
        activeLabel="Help Center"
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
              <h1 className="text-[20px] font-bold leading-tight text-[#241065] sm:text-[22px] lg:text-[24px]">
                Troubleshooting
              </h1>
              <p className="mt-2 text-[12px] leading-[18px] text-[#4B5563] sm:text-[14px] sm:leading-5 lg:text-[16px]">
                Fix common problems and errors and get help with technical
                issues.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:mt-10 lg:gap-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const panelId = `troubleshooting-faq-${index}`;

                return (
                  <article
                    key={faq.title}
                    className="overflow-hidden rounded-[20px] border border-[#D1D5DB] bg-[#F4F3FF] transition-shadow hover:shadow-[0_5px_15px_rgba(36,16,101,0.06)] lg:rounded-[24px]"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex min-h-[80px] w-full items-center justify-between gap-3 px-4 py-4 text-left sm:min-h-[88px] sm:px-5 lg:min-h-[86px] lg:items-center lg:px-6 lg:py-6"
                    >
                      <span className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-[#3F1E94] sm:text-[14px] lg:text-[16px] lg:leading-6">
                        {faq.title}
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
                        <p className="text-[12px] leading-[18px] text-[#4B5563] sm:text-[13px]">
                          {faq.answer}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(faq.path)}
                          className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#6133DA] underline decoration-[#C4B5FD] underline-offset-4 transition hover:text-[#4D26B5] sm:text-[13px]"
                        >
                          {faq.action}
                          <ArrowRight size={13} />
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
