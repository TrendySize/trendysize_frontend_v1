// Any protected page can ask the onboarding gate to reopen the tour by
// dispatching this event. Keeping it as an event avoids threading a provider
// through every page that already renders its own sidebar.
export const START_TOUR_EVENT = "trendysize:start-tour";

export function startGuidedTour() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(START_TOUR_EVENT));
}

// The policy is versioned by the backend. A profile without an accepted
// version (or with an older one) must accept before the app can be used.
export function needsDataPolicy(profile) {
  if (!profile) return false;

  if (!profile.dataPolicyAcceptedAt) return true;

  const current = profile.dataPolicyCurrentVersion;
  if (!current) return false;

  return profile.dataPolicyVersion !== current;
}
