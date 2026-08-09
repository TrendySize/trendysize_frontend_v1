import { useEffect, useRef, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import verifyIllustration from "../assets/images/email.png";
import { verifyEmail, resendOtp } from "../services/api";

const EmailVerify = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputsRef = useRef([]);

  // Get the email that was saved during signup
  const email =
    localStorage.getItem("verification_email") || "";

  // Countdown timer
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Automatically focus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Handle typing
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    setError("");
    setSuccess("");

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pasted)) {
      setError("Please paste a valid 6-digit code.");
      return;
    }

    const digits = pasted.split("");

    setOtp(digits);
    setError("");
    setSuccess("");

    inputsRef.current[5]?.focus();
  };

  // Verify OTP
  const handleVerify = async () => {
    const code = otp.join("");

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Your email address could not be found. Please sign up again."
      );
      return;
    }

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const data = await verifyEmail(email, code);

      console.log("Email verification successful:", data);

      setSuccess(
        data.message || "Your email has been verified successfully."
      );

      // Remove temporary verification email
      localStorage.removeItem("verification_email");

      // Give the user a moment to see the success message
      setTimeout(() => {
        navigate("/signin");
      }, 1200);
    } catch (err) {
      console.error("Email verification error:", err);

      if (err.data?.errors) {
        const firstError =
          Object.values(err.data.errors)[0]?.[0];

        setError(
          firstError ||
            err.data.message ||
            "Invalid verification code."
        );
      } else {
        setError(
          err.message ||
            "Unable to verify your email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email) {
      setError(
        "Your email address could not be found. Please sign up again."
      );
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResending(true);

      const data = await resendOtp(email);

      console.log("OTP resent:", data);

      setOtp(["", "", "", "", "", ""]);
      setTimer(45);

      setSuccess(
        data.message ||
          "A new verification code has been sent to your email."
      );

      inputsRef.current[0]?.focus();
    } catch (err) {
      console.error("Resend OTP error:", err);

      if (err.data?.errors) {
        const firstError =
          Object.values(err.data.errors)[0]?.[0];

        setError(
          firstError ||
            err.data.message ||
            "Unable to resend the verification code."
        );
      } else {
        setError(
          err.message ||
            "Unable to resend the verification code."
        );
      }
    } finally {
      setResending(false);
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
                onClick={() => {
                  if (window.history.length > 2) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition-all duration-300 hover:bg-[#DCD6FF] hover:scale-105"
              >
                <HiChevronLeft size={18} />
              </button>

              <h1 className="flex-1 pr-8 text-center text-[28px] font-bold leading-9 text-[#241065] sm:text-[32px]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
                Verify Email
              </h1>
            </div>

            <div className="rounded-[32px] border border-[#E9E7FF] bg-white p-8 shadow-[0_25px_70px_rgba(0,0,0,0.06)] sm:p-10">
              <div className="mb-6 flex justify-center">
                <img
                  src={verifyIllustration}
                  alt="Email verification"
                  className="h-32 w-32 object-contain"
                />
              </div>

              <div className="mb-8 text-center">
                <p className="text-base font-medium leading-relaxed text-[#241065]">
                  Enter the 6-digit code sent to
                </p>

                {email ? (
                  <p className="mt-1 break-all font-semibold text-[#241065]">
                    {email}
                  </p>
                ) : (
                  <p className="mt-1 font-medium text-red-500">
                    Email address not found
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                  {success}
                </div>
              )}

              <div
                className="mb-8 flex justify-center gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleChange(index, e.target.value)
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(index, e)
                    }
                    className="h-14 w-11 rounded-xl border border-[#D8D6FE] bg-white text-center text-xl font-semibold text-[#241065] outline-none transition focus:border-[#6133DA] focus:ring-4 focus:ring-[#6133DA]/10 sm:w-12"
                    aria-label={`Verification digit ${index + 1}`}
                  />
                ))}
              </div>

              <div className="mb-8 text-center">
                {timer > 0 ? (
                  <p className="text-sm font-medium text-[#4B5563]">
                    Resend code in 00:{String(timer).padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="font-semibold text-[#6133DA] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || !email}
                className="flex h-14 w-full items-center justify-center rounded-xl bg-[#6133DA] text-lg font-bold text-white shadow-lg shadow-[#6133DA]/20 transition-all hover:bg-[#542BC2] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailVerify;