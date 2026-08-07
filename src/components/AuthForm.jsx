import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function AuthForm({ isSignUp = false, submitLabel = "Continue" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="w-full space-y-4">
      {isSignUp && (
        <div>
          <label className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
        />
      </div>

      <div>
        <label className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
          Password
        </label>

        <div className="flex h-12 items-center justify-between rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 transition focus-within:border-[#6133DA] focus-within:ring-2 focus-within:ring-[#EBE9FE]">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full bg-transparent text-[14px] font-medium text-[#241065] outline-none placeholder:text-[#6B7280]"
          />

          <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-4 text-[#7A5DF5] transition-colors hover:text-[#6133DA]">
            {showPassword ? <HiOutlineEyeOff size={24} /> : <HiOutlineEye size={24} />}
          </button>
        </div>

        {isSignUp && (
          <div className="mt-4">
            <label className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
              Confirm Password
            </label>
            <div className="flex h-12 items-center justify-between rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 transition focus-within:border-[#6133DA] focus-within:ring-2 focus-within:ring-[#EBE9FE]">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full bg-transparent text-[14px] font-medium text-[#241065] outline-none placeholder:text-[#6B7280]"
              />

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-4 text-[#7A5DF5] transition-colors hover:text-[#6133DA]">
                {showPassword ? <HiOutlineEyeOff size={24} /> : <HiOutlineEye size={24} />}
              </button>
            </div>
          </div>
        )}

        {!isSignUp && (
          <div className="mt-3 flex justify-end">
            <button type="button" className="text-[12px] font-medium text-[#6133DA] hover:underline">
              Forgot password?
            </button>
          </div>
        )}
      </div>

      <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#6133DA] text-[16px] font-semibold text-white transition-all duration-300 hover:bg-[#4F28C7] hover:shadow-lg active:scale-[0.98]" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
        {submitLabel}
      </button>

      <div className="my-3 flex items-center">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="px-4 text-sm text-gray-500">OR</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>

      <button type="button" className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white font-semibold text-gray-700 transition hover:bg-gray-50">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-6 w-6" />
        Continue with Google
      </button>

      <p className="mt-3 text-center text-[13px] font-medium text-[#4B5563]">
        {isSignUp ? (
          <>Already have an account? <button type="button" className="font-semibold text-[#6133DA] hover:underline">Log in</button></>
        ) : (
          <>Don't have an account?{' '}<button type="button" className="font-semibold text-[#6133DA] hover:underline">Sign up</button></>
        )}
      </p>
    </form>
  );
}
