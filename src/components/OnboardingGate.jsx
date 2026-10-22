import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DataPolicyModal from "./DataPolicyModal";
import GuidedTour from "./GuidedTour";
import {
  acceptDataPolicy,
  clearToken,
  completeGuidedTour,
  logout as apiLogout,
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
      {tourOpen && <GuidedTour onFinish={handleTourFinish} />}
    </>
  );
}
