import { useEffect, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import verifyIllustration from "../assets/images/email.png";
import { confirmEmail } from "../services/api";

// Handles the emailed confirmation link:
//   {FrontendBaseUrl}/confirm-email?userId=<guid>&token=<url-encoded>
const ConfirmEmail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [state, setState] = useState("checking"); // checking | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = params.get("userId");
    const rawToken = params.get("token");

    let active = true;

    Promise.resolve()
      .then(() => {
        if (!userId || !rawToken) {
          throw new Error("missing-link");
        }
        const token = decodeURIComponent(rawToken);
        return confirmEmail(userId, token);
      })
      .then((data) => {
        if (!active) return;
        setState("success");
        setMessage(data.message || "Email confirmed successfully.");
        setTimeout(() => navigate("/signin"), 1800);
      })
      .catch((err) => {
        if (!active) return;
        setState("error");
        setMessage(
          err.message === "missing-link"
            ? "This confirmation link is missing information. Please request a new one."
            : err.message || "We could not confirm your email."
        );
      });

    return () => {
      active = false;
    };
  }, [params, navigate]);

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#F4F3FF]">
      <div className="grid min-h-screen lg:grid-cols-[0.8fr_0.9fr]">
        <div className="hidden lg:block">
          <AuthPanel />
        </div>

        <div className="relative flex items-center justify-center bg-[#F4F3FF] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
          <div className="w-full max-w-105">
            <div className="mb-6 flex items-center justify-between sm:mb-10">
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition-all duration-300 hover:bg-[#DCD6FF] hover:scale-105"
              >
                <HiChevronLeft size={18} />
              </button>

              <h1
                className="flex-1 pr-8 text-center text-[28px] font-bold leading-9 text-[#241065] sm:text-[32px]"
                style={{ fontFamily: "SF Pro Display, sans-serif" }}
              >
                Confirm Email
              </h1>
            </div>

            <div className="rounded-[32px] border border-[#E9E7FF] bg-white p-8 shadow-[0_25px_70px_rgba(0,0,0,0.06)] sm:p-10">
              <div className="mb-6 flex justify-center">
                <img
                  src={verifyIllustration}
                  alt="Email confirmation"
                  className="h-32 w-32 object-contain"
                />
              </div>

              {state === "checking" && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6133DA]/30 border-t-[#6133DA]" />
                  <p className="text-sm font-medium text-[#241065]">
                    Confirming your email…
                  </p>
                </div>
              )}

              {state === "success" && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                  {message}
                </div>
              )}

              {state === "error" && (
                <>
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                    {message}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/signin")}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-[#6133DA] text-lg font-bold text-white shadow-lg shadow-[#6133DA]/20 transition-all hover:bg-[#542BC2] active:scale-[0.99]"
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConfirmEmail;
