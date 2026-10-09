import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Headphones,
  Mail,
  Menu,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/DashboardSidebar";
import drawerLogo from "../assets/images/nav.png";

const supportEmail = "support@trendysize.com";

export default function ContactSupport() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    "Hi TrendySize Support, I need help."
  )}`;

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">
      <DashboardSidebar
        activeLabel="Contact Support"
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
              Contact Support
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

        <section className="px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-11 lg:pt-6">
          <div className="w-full max-w-[1120px]">
            <button
              type="button"
              aria-label="Back to Help Center"
              onClick={() => navigate("/help-center")}
              className="mb-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition hover:bg-[#D8D6FE]"
            >
              <ArrowLeft size={15} />
            </button>

            <div className="mb-4">
              <h1 className="text-[20px] font-bold leading-tight text-[#241065] sm:text-[23px] lg:text-[26px]">
                Contact Support
              </h1>
              <p className="mt-1.5 max-w-[650px] text-[12px] leading-[18px] text-[#4B5563] sm:text-[13px] sm:leading-[19px] lg:text-[14px]">
                Can’t find what you’re looking for? Tell us what is happening
                and we’ll help you sort it out.
              </p>
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:gap-8">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 rounded-xl border border-[#9CA3AF] p-4 sm:gap-5 sm:p-5"
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="support-subject"
                    className="text-[14px] font-semibold leading-[19px] text-[#241065] sm:text-[16px]"
                  >
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    required
                    maxLength={120}
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Briefly describe your issue"
                    className="h-12 w-full rounded-lg border border-[#D1D5DB] bg-transparent px-3 py-2 text-[13px] text-[#241065] outline-none placeholder:text-[#6B7280] focus:border-[#9B8AFB] focus:ring-2 focus:ring-[#EBE9FE]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="support-message"
                    className="text-[14px] font-semibold leading-[19px] text-[#241065] sm:text-[16px]"
                  >
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    required
                    maxLength={1000}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us what happened and how we can help"
                    className="h-[120px] w-full resize-y rounded-lg border border-[#D1D5DB] bg-transparent px-3 py-2 text-[13px] leading-5 text-[#241065] outline-none placeholder:text-[#6B7280] focus:border-[#9B8AFB] focus:ring-2 focus:ring-[#EBE9FE]"
                  />
                  <span className="text-right text-[12px] leading-[15px] text-[#6B7280]">
                    {message.length}/1000
                  </span>
                </div>

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#6133DA] px-4 text-[15px] font-bold text-[#F4F3FF] transition hover:bg-[#5128C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B8AFB] focus-visible:ring-offset-2 sm:text-[16px]"
                >
                  Send details
                </button>
              </form>

              <aside className="flex flex-col items-center gap-4 rounded-xl bg-[#EBE9FE] px-4 py-5 sm:px-5 sm:py-6 xl:mt-16">
                <div className="flex flex-col items-center gap-2.5">
                  <Headphones
                    size={48}
                    strokeWidth={1.5}
                    className="text-[#6133DA]"
                  />
                  <h2 className="text-[16px] font-semibold text-[#241065]">
                    Other ways to reach us
                  </h2>
                </div>

                <div className="flex w-full flex-col gap-2.5">
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex min-h-[52px] items-center justify-between gap-3 rounded-lg bg-[#F4F3FF] p-2 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B8AFB]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBE9FE] text-[#6133DA]">
                        <Mail size={20} strokeWidth={1.7} />
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-[13px] font-medium text-[#241065]">
                          Email Support
                        </span>
                        <span className="truncate text-[12px] text-[#6B7280]">
                          {supportEmail}
                        </span>
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-[#6133DA]"
                    />
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[52px] items-center justify-between gap-3 rounded-lg bg-[#F4F3FF] p-2 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B8AFB]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#BAE6CD] text-[#1FAF38]">
                        <FaWhatsapp size={20} />
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-[13px] font-medium text-[#241065]">
                          Whatsapp Support
                        </span>
                        <span className="text-[12px] text-[#6B7280]">
                          Chat with our support team
                        </span>
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-[#6133DA]"
                    />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
