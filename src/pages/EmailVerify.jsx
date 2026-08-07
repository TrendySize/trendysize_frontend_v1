import  { useEffect, useRef, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import heroImage from "../assets/images/hero.png";
import verifyIllustration from "../assets/images/email.png";

const EmailVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const inputsRef = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle typing
  const handleChange = (index, value) => {
    if (!/^\\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

    if (!/^\\d{6}$/.test(pasted)) return;

    const digits = pasted.split("");
    setOtp(digits);

    inputsRef.current[5]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");

    if (code.length !== 6) {
      alert("Please enter the complete 6-digit code");
      return;
    }

    console.log("Verifying code:", code);
    // connect backend later
  };

  const handleResend = () => {
    setTimer(45);
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();

    console.log("Resend code");
  };

  return (
    <div className="min-h-screen bg-[#F4F3FF] flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex relative w-[48%] bg-[#6133DA] overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-100"
          style={{
            backgroundImage:
              `url(${heroImage})`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-white to-[#D8D6FE]" />
            </div>

            <h1 className="text-2xl font-bold text-white tracking-wide">
              TRENDYSIZE
            </h1>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[520px]">
            <h2 className="text-white font-bold text-5xl leading-[1.12] mb-8">
              Collect and Manage Customer Measurements Digitally
            </h2>

            <p className="text-[#D8D6FE] text-2xl leading-relaxed font-medium max-w-[440px]">
              Collect, organize and retrieve customer measurements from one
              simple workspace.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[520px]">
          {/* Header */}
          <div className="relative flex items-center justify-center gap-6 mb-10">
            <button
              className="absolute left-0 h-10 w-10 rounded-full bg-[#EBE9FE] flex items-center justify-center text-[#241065] hover:bg-[#DDD9FE] transition"
              aria-label="Go back"
            >
              <HiChevronLeft className="text-xl" />
            </button>

            <h1 className="text-[32px] font-bold text-[#241065]">
              Verify Email
            </h1>
          </div>

          {/* Illustration */}
          {/* Illustration */}
<div className="flex justify-center mb-8">
  <img
    src={verifyIllustration}
    alt="Verify Email"
    className="w-[307px] h-[205px] object-contain"
  />
</div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <p className="text-[#241065] text-base font-medium leading-relaxed">
              Enter the 6-digit code sent to
            </p>

            <p className="text-[#241065] font-semibold mt-1">
              kelvin@fashionhub.com
            </p>
          </div>

          {/* OTP */}
          <div
            className="flex justify-center gap-3 mb-8"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 rounded-xl border border-[#D8D6FE] bg-white text-center text-xl font-semibold text-[#241065] outline-none focus:border-[#6133DA] focus:ring-4 focus:ring-[#6133DA]/10 transition"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="text-center mb-10">
            {timer > 0 ? (
              <p className="text-[#4B5563] text-sm font-medium">
                Resend code in 00:{String(timer).padStart(2, "0")}
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-[#6133DA] font-semibold hover:underline"
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            className="w-full h-14 rounded-xl bg-[#6133DA] text-white text-lg font-bold hover:bg-[#542BC2] active:scale-[0.99] transition-all shadow-lg shadow-[#6133DA]/20"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;