import { useState } from "react";
import { HiChevronLeft, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import { resetPassword } from "../services/api";

// Handles the emailed reset link:
//   {FrontendBaseUrl}/reset-password?email=<url-encoded>&token=<url-encoded>
const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = params.get("email") ? decodeURIComponent(params.get("email")) : "";
  const token = params.get("token") ? decodeURIComponent(params.get("token")) : "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const linkInvalid = !email || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, token, password);
      setDone(true);
      setTimeout(() => navigate("/signin"), 1800);
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition-all duration-300 hover:bg-[#DCD6FF] "
              >
                <HiChevronLeft size={18} />
              </button>

              <h1
                className="flex-1 pr-8 text-center text-3xl font-bold leading-9 text-[#241065] sm:text-4xl"
                style={{ fontFamily: "SF Pro Display, sans-serif" }}
              >
                New Password
              </h1>
            </div>

            <div className="rounded-xl border border-[#E9E7FF] bg-white p-8  sm:p-10">
              {linkInvalid ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                  This reset link is invalid or incomplete. Please request a new
                  one from the sign-in page.
                </div>
              ) : done ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                  Password reset successfully. Redirecting you to sign in…
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="mb-6 text-center text-sm font-medium text-[#4B5563]">
                    Choose a new password for <strong>{email}</strong>.
                  </p>

                  {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="mb-5">
                    <label
                      className="mb-2 block text-base font-semibold leading-6 text-[#241065]"
                      style={{ fontFamily: "SF Pro Display, sans-serif" }}
                    >
                      New Password
                    </label>
                    <div className="flex h-14 items-center justify-between rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 transition focus-within:border-[#6133DA] focus-within:ring-2 focus-within:ring-[#EBE9FE]">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full bg-transparent text-sm font-medium text-[#241065] outline-none placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="ml-4 text-[#7A5DF5] transition-colors hover:text-[#6133DA]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <HiOutlineEyeOff size={24} /> : <HiOutlineEye size={24} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label
                      className="mb-2 block text-base font-semibold leading-6 text-[#241065]"
                      style={{ fontFamily: "SF Pro Display, sans-serif" }}
                    >
                      Confirm Password
                    </label>
                    <div className="flex h-14 items-center justify-between rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 transition focus-within:border-[#6133DA] focus-within:ring-2 focus-within:ring-[#EBE9FE]">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        className="w-full bg-transparent text-sm font-medium text-[#241065] outline-none placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#6133DA] text-base font-semibold text-white transition-all duration-300 hover:bg-[#4F28C7]   disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ fontFamily: "SF Pro Display, sans-serif" }}
                  >
                    {loading ? "Resetting…" : "Reset password"}
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

export default ResetPassword;
