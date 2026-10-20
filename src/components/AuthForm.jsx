
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { signup, login, googleSignIn, setToken, getProfile } from "../services/api";
import { loadGoogleIdentity, promptGoogleCredential } from "../services/google";

export default function AuthForm({
  isSignUp = false,
  submitLabel = "Continue",
}) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign-in fields
  const [loginValue, setLoginValue] = useState("");

  // Signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // Shared password fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ==================================================
    // SIGN UP
    // ==================================================
    if (isSignUp) {
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !username.trim() ||
        !phoneNumber.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword
      ) {
        setError("Please complete all required fields.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      try {
        setLoading(true);

        const data = await signup({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          password,
        });

        console.log("Signup successful:", data);

        // Inform the user their account needs email confirmation, then send
        // them to sign in. (The backend emails a confirmation link.)
        setInfo(
          data.message ||
            "Account created. Please check your email to confirm your account."
        );

        setTimeout(() => navigate("/signin"), 1500);
      } catch (err) {
        console.error("Signup error:", err);
        setError(err.message || "Unable to create your account.");
      } finally {
        setLoading(false);
      }

      return;
    }

    // ==================================================
    // SIGN IN
    // ==================================================
    if (!loginValue.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(loginValue.trim(), password);

      // The .NET backend returns only { token }.
      setToken(data.token);

      // Hydrate the profile with the authenticated /api/auth/me endpoint.
      const profile = await getProfile();
      localStorage.setItem("auth_user", JSON.stringify(profile));

      console.log("Login successful:", profile);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const goToSignIn = () => {
    setError("");
    setInfo("");
    navigate("/signin");
  };

  const goToSignUp = () => {
    setError("");
    setInfo("");
    navigate("/signup");
  };

  const handleForgotPassword = () => {
    setError("");
    setInfo("");
    navigate("/forgot-password");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setInfo("");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError(
        "Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in .env."
      );
      return;
    }

    let idToken;
    try {
      setLoading(true);
      await loadGoogleIdentity();
      idToken = await promptGoogleCredential(clientId);

      // Returning users already have an account; new users need a handle.
      // Send the username when the signup form supplied one.
      const data = await googleSignIn({
        idToken,
        username: username.trim() || undefined,
      });

      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google sign-in error:", err);

      // New Google account with no username -> backend asks for one.
      if (err.status === 400 && /username is required/i.test(err.message || "")) {
        navigate("/google-handle", { state: { idToken } });
        return;
      }

      setError(err.message || "Unable to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-0"
    >
      {/* ==================================================
          SIGNUP FIELDS
      ================================================== */}

      {isSignUp && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* First Name */}
            <div className="mb-5">
              <label
                className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
                style={{
                  fontFamily: "SF Pro Display, sans-serif",
                }}
              >
                First Name
              </label>

              <input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                autoComplete="given-name"
                className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
              />
            </div>

            {/* Last Name */}
            <div className="mb-5">
              <label
                className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
                style={{
                  fontFamily: "SF Pro Display, sans-serif",
                }}
              >
                Last Name
              </label>

              <input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
                autoComplete="family-name"
                className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
              />
            </div>
          </div>

              <div className="mb-5">
            <label
              className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
              style={{
                fontFamily: "SF Pro Display, sans-serif",
              }}
            >
              Username
            </label>

            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              autoComplete="username"
              className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
            />
          </div>

          <div className="mb-5">
            <label
              className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
              style={{
                fontFamily: "SF Pro Display, sans-serif",
              }}
            >
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
              autoComplete="tel"
              className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
            />
          </div>
        </>
      )}

      {/* ==================================================
          EMAIL / LOGIN
      ================================================== */}

      <div className="mb-5">
        <label
          className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
          style={{
            fontFamily: "SF Pro Display, sans-serif",
          }}
        >
          {isSignUp
            ? "Email Address"
            : "Email Address"}
        </label>

        <input
          type={isSignUp ? "email" : "email"}
          placeholder={
            isSignUp
              ? "Enter your email"
              : "Enter your email"
          }
          value={isSignUp ? email : loginValue}
          onChange={(e) =>
            isSignUp
              ? setEmail(e.target.value)
              : setLoginValue(e.target.value)
          }
          autoComplete={
            isSignUp ? "email" : "username"
          }
          className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
        />
      </div>

      {/* ==================================================
          PASSWORD
      ================================================== */}

      <div className="mb-5">
        <label
          className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
          style={{
            fontFamily: "SF Pro Display, sans-serif",
          }}
        >
          Password
        </label>

        <div className="flex h-14 items-center justify-between rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 transition focus-within:border-[#6133DA] focus-within:ring-2 focus-within:ring-[#EBE9FE]">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete={
              isSignUp
                ? "new-password"
                : "current-password"
            }
            className="w-full bg-transparent text-[14px] font-medium text-[#241065] outline-none placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            className="ml-4 text-[#7A5DF5] transition-colors hover:text-[#6133DA]"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <HiOutlineEyeOff size={24} />
            ) : (
              <HiOutlineEye size={24} />
            )}
          </button>
        </div>

        {/* ==================================================
            CONFIRM PASSWORD
        ================================================== */}

        {isSignUp && (
          <div className="mt-5">
            <label
              className="mb-2 block text-[16px] font-semibold leading-6 text-[#241065]"
              style={{
                fontFamily: "SF Pro Display, sans-serif",
              }}
            >
              Confirm Password
            </label>

            <div className="flex h-14 items-center justify-between rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 transition focus-within:border-[#6133DA] focus-within:ring-2 focus-within:ring-[#EBE9FE]">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                autoComplete="new-password"
                className="w-full bg-transparent text-[14px] font-medium text-[#241065] outline-none placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="ml-4 text-[#7A5DF5] transition-colors hover:text-[#6133DA]"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <HiOutlineEyeOff size={24} />
                ) : (
                  <HiOutlineEye size={24} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          FORGOT PASSWORD
      ================================================== */}

      {!isSignUp && (
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[12px] font-medium text-[#6133DA] hover:underline"
          >
            Forgot password?
          </button>
        </div>
      )}

      {info && (
        <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
          {info}
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ==================================================
          SUBMIT
      ================================================== */}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#6133DA] text-[16px] font-semibold text-white transition-all duration-300 hover:bg-[#4F28C7] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          fontFamily: "SF Pro Display, sans-serif",
        }}
      >
        {loading
          ? isSignUp
            ? "Creating account..."
            : "Signing in..."
          : submitLabel}
      </button>

      {/* ==================================================
          GOOGLE
      ================================================== */}

      <div className="my-3 flex items-center">
        <div className="h-px flex-1 bg-gray-300" />

        <span className="px-4 text-sm text-gray-500">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-300" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="h-6 w-6"
        />

        Continue with Google
      </button>

      {/* ==================================================
          SWITCH AUTH PAGE
      ================================================== */}

      <p className="mt-3 text-center text-[13px] font-medium text-[#4B5563]">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={goToSignIn}
              className="font-semibold text-[#6133DA] hover:underline"
            >
              Login
            </button>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={goToSignUp}
              className="font-semibold text-[#6133DA] hover:underline"
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </form>
  );
}
