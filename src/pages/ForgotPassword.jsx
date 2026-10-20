import { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import { forgotPassword } from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
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
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="mb-6 text-center text-sm font-medium text-[#4B5563]">
                    Enter the email you signed up with and we&apos;ll send you a
                    reset link.
                  </p>

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
