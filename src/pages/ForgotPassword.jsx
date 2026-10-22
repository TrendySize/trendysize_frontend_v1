import { useEffect, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import { forgotPassword, getEmailStatus } from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // What the server says about its ability to send mail: { enabled, healthy }. Null means "not
  // known yet", which is treated as "mail works" so a temporary failure to reach the status
  // endpoint never blocks anyone.
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getEmailStatus()
      .then((status) => {
        if (!cancelled) setEmailStatus(status);
      })
      .catch(() => {
        // The status endpoint is optional; the API reports its own error if it cannot send.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // With no mail transport there is no way to deliver a reset link, so the form says so instead
  // of accepting an address and then going quiet.
  const mailDisabled = emailStatus?.enabled === false;
  const mailUnhealthy = emailStatus?.enabled === true && emailStatus?.healthy === false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (mailDisabled) {
      setError(
        "We can't send password reset emails at the moment. Please contact support at support@trendysize.com and we'll help you back in."
      );
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim());
      // The backend returns the same response whether or not the email exists.
      setSent(true);
    } catch (err) {
      setError(err.message || "Unable to send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                Reset Password
              </h1>
            </div>

            <div className="rounded-[32px] border border-[#E9E7FF] bg-white p-8 shadow-[0_25px_70px_rgba(0,0,0,0.06)] sm:p-10">
              {sent ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                  If that email is registered, a password reset link has been
                  sent. Please check your inbox.
                </div>
              ) : mailDisabled ? (
                /* No mail transport: there is no link to send, so the page says exactly that
                   rather than letting the user submit an address and wait for nothing. */
                <div className="rounded-xl border border-[#FDE68A] bg-[#FEF9C3] px-4 py-3 text-center">
                  <p className="text-sm font-semibold text-[#78350F]">
                    Password reset by email is unavailable right now.
                  </p>
                  <p className="mt-2 text-[13px] leading-5 text-[#92400E]">
                    Please contact support at{" "}
                    <a
                      href="mailto:support@trendysize.com"
                      className="font-semibold underline underline-offset-2"
                    >
                      support@trendysize.com
                    </a>{" "}
                    and we&apos;ll help you get back into your account.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="mb-6 text-center text-sm font-medium text-[#4B5563]">
                    Enter the email you signed up with and we&apos;ll send you a
                    reset link.
                  </p>

                  {mailUnhealthy && (
                    <div className="mb-5 rounded-xl border border-[#FDE68A] bg-[#FEF9C3] px-4 py-3 text-[13px] font-medium leading-5 text-[#78350F]">
                      Email delivery is having trouble right now, so the link may
                      take longer than usual to arrive.
                    </div>
                  )}

                  {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="mb-5">
                    <label
                      className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
                      style={{ fontFamily: "SF Pro Display, sans-serif" }}
                    >
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#6133DA] text-[16px] font-semibold text-white transition-all duration-300 hover:bg-[#4F28C7] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ fontFamily: "SF Pro Display, sans-serif" }}
                  >
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
