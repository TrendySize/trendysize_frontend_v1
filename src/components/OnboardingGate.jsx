import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MailCheck } from "lucide-react";

import DataPolicyModal from "./DataPolicyModal";
import GuidedTour from "./GuidedTour";
import {
  acceptDataPolicy,
  clearToken,
  completeGuidedTour,
  getProfile,
  logout as apiLogout,
  getEmailStatus,
  resendConfirmation,
} from "../services/api";
import { needsDataPolicy, START_TOUR_EVENT } from "../onboarding";

// Renders the authenticated app only after the current data policy has been
// accepted. The first-run guided tour opens once, then stays available through
// the retake entry points on Settings and the Help Center.
export default function OnboardingGate({ profile, onProfileChange, children }) {
  const navigate = useNavigate();

  // Derived from the account, so a background profile refresh updates the gate
  // without an effect that writes state.
  const policyOpen = needsDataPolicy(profile);

  const [tourOpen, setTourOpen] = useState(
    () => Boolean(profile) && !needsDataPolicy(profile) && !profile.tourCompletedAt
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationError, setConfirmationError] = useState("");
  const needsEmailVerification = profile?.emailConfirmed === false;

  const applyProfile = (patch) => {
    const next = { ...(profile || {}), ...patch };
    onProfileChange(next);
    return next;
  };

  // Settings and Help Center reopen the tour through this event.
  useEffect(() => {
    const handleStartTour = () => setTourOpen(true);
    window.addEventListener(START_TOUR_EVENT, handleStartTour);
    return () => window.removeEventListener(START_TOUR_EVENT, handleStartTour);
  }, []);

  useEffect(() => {
    if (!needsEmailVerification) return undefined;

    let active = true;
    getEmailStatus()
      .then((status) => {
        if (active) setEmailStatus(status);
      })
      .catch((statusError) => {
        console.error("Could not check email delivery status:", statusError);
      });

    return () => {
      active = false;
    };
  }, [needsEmailVerification]);

  const handleResendConfirmation = async () => {
    if (!profile?.email || resendingConfirmation) return;

    setResendingConfirmation(true);
    setConfirmationMessage("");
    setConfirmationError("");

    try {
      const data = await resendConfirmation(profile.email);
      setConfirmationMessage(
        data?.message || "We've sent a new confirmation link. Check your inbox."
      );
    } catch (resendError) {
      console.error("Could not resend confirmation email:", resendError);
      setConfirmationError(
        resendError?.message || "Unable to resend the confirmation email."
      );
    } finally {
      setResendingConfirmation(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await apiLogout();
    } catch (logoutError) {
      console.error("Could not notify the server about sign out:", logoutError);
    } finally {
      clearToken();
      navigate("/signin", { replace: true });
    }
  };

  const handleCheckVerification = async () => {
    if (checkingVerification) return;

    setCheckingVerification(true);
    setConfirmationError("");

    try {
      const latestProfile = await getProfile();
      onProfileChange(latestProfile);
      if (!latestProfile?.emailConfirmed) {
        setConfirmationError(
          "Your email is not confirmed yet. Open the link in your inbox, then check again."
        );
      }
    } catch (profileError) {
      console.error("Could not refresh email verification status:", profileError);
      setConfirmationError(
        profileError?.message || "Unable to check your email status. Please try again."
      );
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleAccept = async () => {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const data = await acceptDataPolicy();
      const next = applyProfile({
        dataPolicyAcceptedAt: data?.dataPolicyAcceptedAt || new Date().toISOString(),
        dataPolicyVersion: data?.dataPolicyVersion,
        dataPolicyCurrentVersion: data?.dataPolicyCurrentVersion,
      });

      // First run: the tour starts as soon as the gate lifts.
      if (!next.tourCompletedAt) {
        setTourOpen(true);
      }
    } catch (acceptError) {
      console.error("Could not save data policy acceptance:", acceptError);
      setError(
        acceptError?.message ||
          "We couldn't save your acceptance. Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDecline = async () => {
    if (saving) return;

    setSaving(true);
    try {
      await apiLogout().catch(() => {});
    } finally {
      // clearToken also wipes the cached profile and user-scoped media, so the
      // next person on this device starts clean.
      clearToken();
      navigate("/signin", {
        replace: true,
        state: { dataPolicyDeclined: true },
      });
      setSaving(false);
    }
  };

  const handleTourFinish = async () => {
    const completedAt = new Date().toISOString();
    setTourOpen(false);
    applyProfile({ tourCompletedAt: completedAt });

    try {
      const data = await completeGuidedTour();
      if (data?.tourCompletedAt) {
        applyProfile({ tourCompletedAt: data.tourCompletedAt });
      }
    } catch (tourError) {
      // Keep the optimistic completion: the tour is not important enough to
      // interrupt the user with an error, and the next sign-in can sync it.
      console.error("Could not save guided tour completion:", tourError);
    }
  };

  if (needsEmailVerification) {
    return (
      <main className="fixed inset-0 z-[1200] flex items-center justify-center bg-[var(--tk-bg)] px-4 py-8">
        <section
          aria-labelledby="email-verification-title"
          className="w-full max-w-[460px] rounded-2xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] p-6 shadow-2xl sm:p-8"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-brand)]/10 text-[var(--tk-brand)]">
            <MailCheck size={24} aria-hidden="true" />
          </div>
          <h1
            id="email-verification-title"
            className="text-xl font-bold text-[var(--tk-ink)]"
          >
            Verify your email to continue
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--tk-ink-muted)]">
            Confirm {profile.email ? <strong>{profile.email}</strong> : "your email address"} to unlock your TrendySize workspace. You can request a fresh confirmation link below.
          </p>

          {confirmationMessage && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            >
              {confirmationMessage}
            </p>
          )}
          {confirmationError && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {confirmationError}
            </p>
          )}
          {emailStatus?.enabled === false && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Email delivery is unavailable right now. Please try again later.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {emailStatus?.enabled !== false && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingConfirmation || !profile?.email}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--tk-brand)] px-4 py-2 text-sm font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendingConfirmation ? "Sending confirmation link…" : "Resend confirmation email"}
              </button>
            )}
            <button
              type="button"
              onClick={handleCheckVerification}
              disabled={checkingVerification}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--tk-border-strong)] px-4 py-2 text-sm font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] disabled:cursor-wait disabled:opacity-60"
            >
              {checkingVerification ? "Checking email status…" : "I've verified my email"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--tk-border-strong)] px-4 py-2 text-sm font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)]"
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (policyOpen) {
    return (
      <DataPolicyModal
        onAccept={handleAccept}
        onDecline={handleDecline}
        saving={saving}
        error={error}
      />
    );
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {tourOpen && <GuidedTour onFinish={handleTourFinish} />}
      </AnimatePresence>
    </>
  );
}
