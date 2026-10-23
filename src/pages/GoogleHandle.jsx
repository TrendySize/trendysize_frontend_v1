import { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import { googleSignIn, setToken } from "../services/api";

// Shown when a first-time Google user must choose a store handle.
// The Google ID token is passed via router state from the sign-in form.
const GoogleHandle = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const idToken = state?.idToken;

  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!idToken) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#F4F3FF] px-4">
        <div className="w-full max-w-md rounded-xl border border-[#E9E7FF] bg-white p-10 text-center ">
          <p className="mb-6 text-sm font-medium text-red-600">
            Your Google session has expired. Please sign in with Google again.
          </p>
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#6133DA] text-base font-semibold text-white hover:bg-[#4F28C7]"
          >
            Back to sign in
          </button>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please choose a store handle.");
      return;
    }

    try {
      setLoading(true);
      const data = await googleSignIn({
        idToken,
        username: username.trim(),
        whatsappNumber: whatsapp.trim() || undefined,
      });
      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      // 409 -> handle taken; anything else is a real error.
      setError(err.message || "Unable to finish setting up your account.");
    } finally {
      setLoading(false);
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
                onClick={() => navigate("/signin")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE9FE] text-[#241065] transition-all duration-300 hover:bg-[#DCD6FF] "
              >
                <HiChevronLeft size={18} />
              </button>

              <h1
                className="flex-1 pr-8 text-center text-3xl font-bold leading-9 text-[#241065] sm:text-4xl"
                style={{ fontFamily: "SF Pro Display, sans-serif" }}
              >
                Choose your handle
              </h1>
            </div>

            <div className="rounded-xl border border-[#E9E7FF] bg-white p-8  sm:p-10">
              <p className="mb-6 text-center text-sm font-medium text-[#4B5563]">
                One last step: pick the handle customers will use to reach your
                store on WhatsApp.
              </p>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label
                    className="mb-2 block text-base font-semibold leading-6 text-[#241065]"
                    style={{ fontFamily: "SF Pro Display, sans-serif" }}
                  >
                    Store Handle
                  </label>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-sm font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
                  />
                </div>

                <div className="mb-5">
                  <label
                    className="mb-2 block text-base font-semibold leading-6 text-[#241065]"
                    style={{ fontFamily: "SF Pro Display, sans-serif" }}
                  >
                    WhatsApp Number (optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+2348012345678"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    autoComplete="tel"
                    className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4 text-sm font-medium text-[#241065] transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:outline-none focus:ring-2 focus:ring-[#EBE9FE]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#6133DA] text-base font-semibold text-white transition-all duration-300 hover:bg-[#4F28C7]   disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ fontFamily: "SF Pro Display, sans-serif" }}
                >
                  {loading ? "Creating account…" : "Finish sign-up"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleHandle;
