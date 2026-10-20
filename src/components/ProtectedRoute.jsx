import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, getProfile, clearToken, setUnauthorizedHandler } from "../services/api";

// Guards authenticated routes. Verifies the stored JWT by hydrating the profile;
// on 401 (empty body) it clears the token and redirects to /signin.
export default function ProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState(() => (getToken() ? "checking" : "anon"));

  // Any 401 from any request clears the token globally.
  useEffect(() => {
    setUnauthorizedHandler(() => clearToken());
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (status !== "checking") return;

    let active = true;
    getProfile()
      .then((profile) => {
        if (!active) return;
        localStorage.setItem("auth_user", JSON.stringify(profile));
        setStatus("authed");
      })
      .catch(() => {
        if (!active) return;
        clearToken();
        setStatus("anon");
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
