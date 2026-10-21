import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, getProfile, clearToken, setUnauthorizedHandler } from "../services/api";

// A cached profile makes the app usable instantly. The .NET backend can be
// cold (Render free tier: 15–60s), so we must NOT block the whole UI on a
// fresh /auth/me — that looked like a blank page. If we have a token we render
// right away and verify in the background, only bouncing on a hard 401.
function readCachedUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

// Guards authenticated routes. Verifies the stored JWT by hydrating the profile;
// on 401 (empty body) it clears the token and redirects to /signin.
export default function ProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState(() => {
    if (!getToken()) return "anon";
    // Optimistically trust a cached profile so we don't flash a blocking
    // "Checking your session…" screen while the backend wakes up.
    return readCachedUser() ? "authed" : "checking";
  });

  // Any 401 from any request clears the token globally.
  useEffect(() => {
    setUnauthorizedHandler(() => clearToken());
    return () => setUnauthorizedHandler(null);
  }, []);

  // Always verify the token in the background, even when we optimistically
  // rendered from cache. A definitive 401 clears the token and redirects.
  useEffect(() => {
    if (!getToken()) return undefined;

    let active = true;
    getProfile()
      .then((profile) => {
        if (!active || !profile) return;
        localStorage.setItem("auth_user", JSON.stringify(profile));
        setStatus("authed");
      })
      .catch((error) => {
        if (!active) return;
        // Only sign out on a real auth failure. A network error / cold-start
        // timeout must not log the user out — keep the cached session.
        if (error?.status === 401) {
          clearToken();
          setStatus("anon");
        }
      });

    return () => {
      active = false;
    };
  }, [status]);

  if (status === "anon") {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F3FF] text-[#241065]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6133DA]/30 border-t-[#6133DA]" />
          <p className="text-sm font-medium">Checking your session…</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
