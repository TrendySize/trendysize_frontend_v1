import { useEffect } from "react";
import { Phone, Ruler } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { whatsappLinkFor } from "../services/api";

const MEASURE_TOKEN_KEY = "trendySize_measure_token";

/*
|--------------------------------------------------------------------------
| CUSTOMER PROFILE (public vendor landing)
|--------------------------------------------------------------------------
|
| The backend exposes no public profile JSON — the only public vendor
| surface is a WhatsApp redirect (GET /api/public/v/{username}). This page
| therefore forwards visitors to that endpoint, preserving any measurement
| token so the customer can continue into the measure flow.
|
*/

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const username =
    params.get("username") || params.get("vendor") || "";
  const measureToken =
    params.get("token") ||
    params.get("measurementToken") ||
    "";

  const missingUsername = !username;

  useEffect(() => {
    if (!username) {
      return;
    }

    if (measureToken) {
      try {
        localStorage.setItem(MEASURE_TOKEN_KEY, measureToken);
      } catch {
        // Storage may be unavailable (private mode); non-fatal.
      }
    }

    window.location.replace(whatsappLinkFor(username));
  }, [username, measureToken]);

  if (!missingUsername) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F3FF]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D8D6FE] border-t-[#6133DA]" />
          <p className="mt-3 text-sm text-[#8179AD]">
            Connecting you to WhatsApp...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F3FF] px-4 text-center">
      <div>
        <Ruler size={26} className="mx-auto text-[#BDB4F7]" />

        <p className="mt-3 text-[14px] font-semibold text-[#241065]">
          This link is incomplete
        </p>

        <p className="mt-1 text-[12px] text-[#8179AD]">
          Open the link exactly as it was shared with you.
        </p>

        {measureToken && (
          <button
            type="button"
            onClick={() => navigate(`/measure?token=${measureToken}`)}
            className="mt-5 inline-flex items-center gap-2 rounded-[6px] bg-[#6133DA] px-5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#5128BC]"
          >
            <Phone size={13} />
            Continue to measurement
          </button>
        )}
      </div>
    </div>
  );
}
