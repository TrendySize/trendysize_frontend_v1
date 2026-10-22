
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { HiOutlineCheckCircle, HiOutlineEnvelope } from "react-icons/hi2";
import {
  signup,
  login,
  googleSignIn,
  resendConfirmation,
  getEmailStatus,
  setToken,
  getProfile,
} from "../services/api";
import { loadGoogleIdentity, promptGoogleCredential } from "../services/google";
import {
  clearUserScopedData,
  profileCacheBelongsToOtherUser,
} from "../sessionCleanup";

// Turns the ASP.NET model-validation shape ({ errors: { Field: ["msg"] } }) into a flat
// { field: "msg" } map that can be attached to individual inputs.
function extractFieldErrors(err) {
  const errors = err?.data?.errors;
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return {};
  }

  const fieldErrors = {};
  for (const [field, messages] of Object.entries(errors)) {
    const list = Array.isArray(messages) ? messages : [messages];
    const text = list.filter(Boolean).join(" ");
    if (text) {
      fieldErrors[field.toLowerCase()] = text;
    }
  }
  return fieldErrors;
}

// Picks the message to show for a failed request. The backend already sends a human-readable
// message for every case, so it is used verbatim; these are the fallbacks for the cases where the
// request never reached the server.
function messageForError(err, fallback) {
  if (!err) return fallback;
  if (err.status === 0) {
    return "Unable to reach the server. Check your connection and try again.";
  }
  if (err.status === 408) {
    return "The server took too long to respond. Please try again.";
  }
  return err.message || fallback;
}

// Small inline message shown under an input when the backend rejected that specific field.
function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[12px] font-medium text-red-600">{message}</p>;
}

// Shared input styling, with an error variant so the field the backend complained about is
// obvious rather than just having a banner at the top of the form.
const inputClass = (hasError = false) =>
  `h-14 w-full rounded-xl border bg-[#F4F3FF] px-4 text-[14px] font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:outline-none ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-[#D1D5DB] focus:border-[#6133DA] focus:ring-2 focus:ring-[#EBE9FE]"
  }`;

const passwordFieldClass = (hasError = false) =>
  `flex h-14 items-center justify-between rounded-xl border bg-[#F4F3FF] px-4 transition focus-within:ring-2 ${
    hasError
      ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-100"
      : "border-[#D1D5DB] focus-within:border-[#6133DA] focus-within:ring-[#EBE9FE]"
  }`;

export default function AuthForm({
  isSignUp = false,
  submitLabel = "Continue",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Set by OnboardingGate when a signed-in user declines the data policy.
  const dataPolicyDeclined =
    !isSignUp && location.state?.dataPolicyDeclined === true;

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

  // The success state replaces the form once an account has been created, so the confirmation
  // message stays on screen instead of disappearing when the page navigates away.
  const [success, setSuccess] = useState(null);

  // Per-field messages returned by the backend's model validation.
  const [fieldErrors, setFieldErrors] = useState({});

  // Whether a confirmation email is currently being re-sent.
  const [resending, setResending] = useState(false);

  // Whether the form offers to resend the confirmation link (the account exists but was never
  // confirmed).
  const [canResend, setCanResend] = useState(false);

  // What the server says about its ability to send mail: { enabled, healthy }. Null means "not
  // known yet", which is treated as "mail works" so a temporary failure to reach the status
  // endpoint never hides anything.
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getEmailStatus()
      .then((status) => {
        if (!cancelled) setEmailStatus(status);
      })
      .catch(() => {
        // The status endpoint is optional. If it cannot be reached the UI keeps showing the
        // mail actions, because the API itself reports a clear error if it cannot send.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Mail can be switched off entirely, in which case there is no link to send and no point
  // offering a button that cannot do anything.
  const mailAvailable = emailStatus?.enabled !== false;

  const resetFeedback = () => {
    setError("");
    setInfo("");
    setFieldErrors({});
    setCanResend(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ==================================================
    // SIGN UP
    // ==================================================
    if (isSignUp) {
      resetFeedback();

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

        // A brand-new account must not inherit anything from whoever used this
        // browser before: neither the cached profile/photos nor a still-valid
        // session token belonging to the previous account.
        await clearUserScopedData({ includeToken: true });

        console.log("Signup successful:", data);

        // The account exists at this point. Whether the confirmation email was delivered is
        // reported by the backend, so the screen can offer to resend it if it did not go out.
        setSuccess({
          title: "Account created",
          message:
            data.message ||
            "Account created. Check your email for a confirmation link.",
          emailSent: data.emailSent !== false,
          // The server has no mail transport, so there is nothing to confirm and the account is
          // ready to use as it is.
          verificationSkipped: data.verificationSkipped === true,
        });
      } catch (err) {
        console.error("Signup error:", err);
        setFieldErrors(extractFieldErrors(err));

        // 409 - the email or the store handle is already taken.
        if (err.status === 409) {
          setError(
            messageForError(err, "That account details are already in use.")
          );
          // An account that was never confirmed still needs its confirmation link, so the form
          // offers to send a new one - but only when the server is able to send mail.
          setCanResend(
            err.code === "email_taken_unconfirmed" && mailAvailable
          );
          return;
        }

        // 403 - the account exists but has been deactivated.
        if (err.status === 403) {
          setError(
            messageForError(err, "This account has been deactivated.")
          );
          return;
        }

        // 400 - the details were rejected (weak password, malformed email, ...).
        if (err.status === 400) {
          setError(
            messageForError(err, "We couldn't create your account with those details.")
          );
          return;
        }

        setError(messageForError(err, "Unable to create your account."));
      } finally {
        setLoading(false);
      }

      return;
    }

    // ==================================================
    // SIGN IN
    // ==================================================
    resetFeedback();

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

      // Switching accounts on the same browser must start from a clean slate,
      // otherwise the previous user's cached profile is shown.
      if (profileCacheBelongsToOtherUser(profile?.email)) {
        await clearUserScopedData();
      }

      localStorage.setItem("auth_user", JSON.stringify(profile));

      console.log("Login successful:", profile);

      // The authenticated app will require email confirmation before exposing protected features.
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setFieldErrors(extractFieldErrors(err));

      // 401 - the email or the password is wrong.
      if (err.status === 401) {
        setError(messageForError(err, "Invalid email or password."));
        return;
      }

      // 403 - the account exists but has been deactivated.
      if (err.status === 403) {
        setError(
          messageForError(err, "This account has been deactivated.")
        );
        return;
      }

      if (err.status === 400) {
        setError(messageForError(err, "Enter your email and password."));
        return;
      }

      setError(messageForError(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Re-sends the confirmation email for an account that exists but was never confirmed.
  const handleResendConfirmation = async () => {
    const targetEmail = (email || loginValue).trim();
    if (!targetEmail) {
      setError("Enter the email address you signed up with.");
      return;
    }

    if (!mailAvailable) {
      setError(
        "Email confirmation is required to use TrendySize, but confirmation email delivery is unavailable right now."
      );
      return;
    }

    try {
      setResending(true);
      const data = await resendConfirmation(targetEmail);
      setSuccess((prev) => ({
        ...(prev || {}),
        title: "Check your inbox",
        message:
          data.message || "We've sent you a new confirmation link. Check your inbox.",
        emailSent: true,
      }));
    } catch (err) {
      console.error("Resend confirmation error:", err);
      setError(messageForError(err, "Unable to resend the confirmation email."));
    } finally {
      setResending(false);
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

  // Once the account exists the form is replaced by a confirmation panel. The message stays on
  // screen with the next step, instead of flashing and navigating away on a timer.
  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EBE9FE] text-[#6133DA]">
            <HiOutlineCheckCircle size={34} aria-hidden="true" />
          </span>

          <h2
            className="mt-5 text-[22px] font-bold text-[#241065]"
            style={{ fontFamily: "SF Pro Display, sans-serif" }}
          >
            {success.title || "Account created"}
          </h2>

          <p className="mt-2 max-w-sm text-[14px] leading-6 text-[#4B5563]">
            {success.message}
          </p>
        </div>

        {success.verificationSkipped ? (
          /* The server has no mail transport, so there is nothing to confirm and no email to
             wait for. Saying so is the honest version of this screen. */
          <div className="flex items-start gap-3 rounded-xl border border-[#BAE6CD] bg-[#EFFCF3] px-4 py-3">
            <HiOutlineCheckCircle
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[#1FAF38]"
            />
            <p className="text-[13px] leading-5 text-[#14532D]">
              Your account is ready to use. Sign in below to get started - there is
              nothing to confirm.
            </p>
          </div>
        ) : success.emailSent ? (
          <div className="flex items-start gap-3 rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 py-3">
            <HiOutlineEnvelope
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[#6133DA]"
            />
            <p className="text-[13px] leading-5 text-[#4B5563]">
              Open the link in that email to confirm your address. If it doesn&apos;t
              arrive within a few minutes, check your spam folder or ask us to send
              it again.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FEF9C3] px-4 py-3">
            <HiOutlineEnvelope
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[#B45309]"
            />
            <p className="text-[13px] leading-5 text-[#78350F]">
              The confirmation email didn&apos;t go out. You can sign in now and
              request a new link whenever you&apos;re ready.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#6133DA] text-[16px] font-semibold text-white transition-all duration-300 hover:bg-[#4F28C7] hover:shadow-lg active:scale-[0.98]"
            style={{ fontFamily: "SF Pro Display, sans-serif" }}
          >
            Go to sign in
          </button>

          {mailAvailable && !success.verificationSkipped && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white text-[15px] font-semibold text-[#241065] transition hover:bg-[#F4F3FF] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "SF Pro Display, sans-serif" }}
            >
              {resending ? "Sending…" : "Resend confirmation email"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      // The browser's native validation bubbles would fire instead of this app's own styled
      // messages, so every form is validated here and by the API, and the results are shown in
      // the same place for every field.
      noValidate
      className="space-y-0"
    >
      {dataPolicyDeclined && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-[#FDE68A] bg-[#FEF9C3] px-4 py-3 text-[12px] leading-5 text-[#78350F]"
        >
          You were signed out because you did not accept the data
          confidentiality and terms of use. You can sign in again and accept
          them to use TrendySize.
        </div>
      )}

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
                className={inputClass(Boolean(fieldErrors.firstname))}
              />
                <FieldError message={fieldErrors.firstname} />
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
                className={inputClass(Boolean(fieldErrors.lastname))}
              />
                <FieldError message={fieldErrors.lastname} />
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
              className={inputClass(Boolean(fieldErrors.username))}
            />
            <FieldError message={fieldErrors.username} />
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
              className={inputClass(Boolean(fieldErrors.phonenumber))}
            />
            <FieldError message={fieldErrors.phonenumber} />
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
          className={inputClass(Boolean(fieldErrors.email))}
        />
            <FieldError message={fieldErrors.email} />
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

        <div className={passwordFieldClass(Boolean(fieldErrors.password))}>
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

        <FieldError message={fieldErrors.password} />

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

            <div className={passwordFieldClass(false)}>
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

      {/* The account already exists but was never confirmed, so the confirmation link is still
          needed. This is the action the message above points at. */}
      {canResend && mailAvailable && (
        <div className="mb-5 rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 py-3">
          <p className="text-[13px] leading-5 text-[#4B5563]">
            Still waiting for your confirmation link?
          </p>
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resending}
            className="mt-2 text-[13px] font-semibold text-[#6133DA] underline underline-offset-2 transition hover:text-[#4F28C7] disabled:opacity-60"
          >
            {resending ? "Sending…" : "Resend confirmation email"}
          </button>
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
