import { HiChevronLeft } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import AuthPanel from "./AuthPanel";
import AuthForm from "./AuthForm";
import ThemeToggle from "./ThemeToggle";

export default function AuthPage({ hidePanelOnMobile = false, pageTitle = "Welcome Back", submitLabel = "Continue", isSignUp = false, heroClassName = "" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <section className="h-screen overflow-x-hidden bg-[var(--tk-bg)]">
      <div className="grid h-screen lg:grid-cols-[0.8fr_0.9fr]">
        <div className={hidePanelOnMobile ? "hidden lg:block h-full" : "block h-full"}>
          <AuthPanel heroClassName={heroClassName} />
        </div>

        <div className="relative flex items-center justify-center bg-[var(--tk-bg)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
          <div className="w-full max-w-105">
            <div className="mb-4 flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-1.5 rounded-full bg-[var(--tk-surface)] py-1 pr-3.5 pl-2 text-[13px] font-semibold text-[var(--tk-ink)] transition-colors hover:bg-[var(--tk-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/50"
              >
                <BrandLogo className="h-6 w-6" />
                Back to home
              </Link>

              <ThemeToggle variant="compact" />
            </div>

            <div className="mb-6 flex items-center justify-between sm:mb-10">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tk-surface)] text-[var(--tk-ink)] transition-all duration-300 hover:bg-[var(--tk-hover)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/50"
              >
                <HiChevronLeft size={18} />
              </button>

              <h2 className="flex-1 pr-8 text-center text-[28px] font-bold leading-9 text-[var(--tk-ink)] sm:text-[32px]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
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
