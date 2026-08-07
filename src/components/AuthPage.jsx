import { HiChevronLeft } from "react-icons/hi2";
import AuthPanel from "./AuthPanel";
import AuthForm from "./AuthForm";

export default function AuthPage({ hidePanelOnMobile = false, pageTitle = "Welcome Back", submitLabel = "Continue", isSignUp = false }) {
  return (
    <section className="min-h-screen overflow-x-hidden bg-[#F4F3FF]">
      <div className="grid min-h-screen lg:grid-cols-[0.8fr_0.9fr]">
        <div className={hidePanelOnMobile ? "hidden lg:block" : "block"}>
          <AuthPanel />
        </div>

        <div className="relative flex items-center justify-center bg-[#F4F3FF] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
          <div className="w-full max-w-105">
            <div className="mb-6 flex items-center justify-between sm:mb-10">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition-all duration-300 hover:bg-[#DCD6FF] hover:scale-105">
                <HiChevronLeft size={18} />
              </button>

              <h2 className="flex-1 pr-8 text-center text-[28px] font-bold leading-9 text-[#241065] sm:text-[32px]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
                {pageTitle}
              </h2>
            </div>

            <AuthForm submitLabel={submitLabel} isSignUp={isSignUp} />
          </div>
        </div>
      </div>
    </section>
  );
}
