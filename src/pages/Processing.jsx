import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { submitPublicMeasurement } from "../services/api";

// Converts a base64 data URL (as stored by the photo pages) into a Blob.
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(header)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export default function Processing() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token =
    params.get("token") || localStorage.getItem("trendySize_measure_token");

  const [progress, setProgress] = useState(0);
  const [state, setState] = useState("submitting"); // submitting | success | retry | manual | error
  const [message, setMessage] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [measurements, setMeasurements] = useState(null);

  const started = useRef(false);

  // Animate the ring while the request is in flight.
  useEffect(() => {
    if (state !== "submitting") return;

    const interval = setInterval(() => {
      setProgress((current) => (current >= 95 ? 95 : current + 1));
    }, 120);

    return () => clearInterval(interval);
  }, [state]);

  // Perform the submission once.
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const fail = (msg) => {
      setState("error");
      setMessage(msg);
    };

    const frontData = localStorage.getItem("trendySize_front_photo");
    const sideData = localStorage.getItem("trendySize_side_photo");
    const detailsRaw = localStorage.getItem("trendySize_customer_details");

    // Validate inside a microtask so no setState runs synchronously in the
    // effect body (avoids cascading renders).
    Promise.resolve()
      .then(() => {
        if (!token) {
          throw Object.assign(new Error("missing-token"), { _fatal: true });
        }
        if (!frontData || !sideData) {
          throw Object.assign(new Error("missing-photos"), { _fatal: true });
        }

        let heightCm = null;
        let customerDetails = {};
        try {
          const details = detailsRaw ? JSON.parse(detailsRaw) : {};
          customerDetails = {
            firstName: details.firstName || undefined,
            lastName: details.lastName || undefined,
            phoneNumber: details.phoneNumber || undefined,
            gender: details.gender,
          };
          if (details.height) {
            const value = Number(details.height);
            if (Number.isFinite(value) && value > 0) {
              // Convert feet to cm when the customer used the ft toggle.
              heightCm =
                details.heightUnit === "ft" ? Math.round(value * 30.48) : value;
            }
          }
        } catch {
          // Ignore malformed stored details; height is optional.
        }

        return submitPublicMeasurement(token, {
          frontPhoto: new File([dataUrlToBlob(frontData)], "front.jpg", {
            type: "image/jpeg",
          }),
          sidePhoto: new File([dataUrlToBlob(sideData)], "side.jpg", {
            type: "image/jpeg",
          }),
          heightCm,
          ...customerDetails,
        });
      })
      .then((data) => {
        setProgress(100);

        if (data.status === "NeedsManualReview") {
          setState("manual");
          setMessage(
            data.message || "This order has been sent to the vendor for manual review."
          );
          return;
        }

        setState("success");
        setMessage(data.message || "Measurement submitted and analyzed successfully.");
        setMeasurements(data.measurements || null);
      })
      .catch((err) => {
        if (err._fatal && err.message === "missing-token") {
          fail(
            "This measurement link is missing its token. Please reopen the link the vendor shared with you."
          );
          return;
        }
        if (err._fatal && err.message === "missing-photos") {
          fail("We could not find your photos. Please go back and capture them again.");
          return;
        }

        // 422 -> retake photos, link remains valid (do NOT auto-retry).
        if (err.status === 422) {
          setState("retry");
          setMessage(
            err.data?.message ||
              "The result wasn't reliable enough. Please retake the photos."
          );
          setAttemptsRemaining(err.data?.attemptsRemaining ?? null);
          return;
        }

        fail(
          err.message ||
            "We couldn't analyse the photos right now. Please try again."
        );
      });
  }, [token]);

  // Returning to the side-photo step is always safe; navigating back in
  // browser history could leave the app (the flow was entered from a shared
  // link) and discard the captured photos.
  const handleBack = () =>
    navigate(`/side-photo${token ? `?token=${token}` : ""}`);

  const retryPhotos = () => {
    localStorage.removeItem("trendySize_front_photo");
    localStorage.removeItem("trendySize_side_photo");
    navigate(`/front-photo${token ? `?token=${token}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-[22px] py-[20px]">
        {/* Top Progress Indicator */}
        <div className="flex h-[7px] w-full shrink-0">
          <div className="h-[7px] flex-1 bg-[#D1D5DB]" />
          <div className="h-[7px] flex-1 bg-[#D1D5DB]" />
          <div className="h-[7px] flex-1 bg-[#D1D5DB]" />
          <div className="h-[7px] flex-1 bg-[#D1D5DB]" />
          <div className="h-[7px] flex-1 bg-[#9CA3AF]" />
          <div className="h-[7px] flex-1 bg-[#9CA3AF]" />
          <div className="h-[7px] flex-1 bg-[#9CA3AF]" />
          <div className="h-[7px] flex-1 bg-[#9CA3AF]" />
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="mt-[26px] flex h-[34px] w-[118px] shrink-0 items-center justify-center gap-[8px] rounded-[10px] border border-[#D1D5DB] bg-[#EBE9FE] px-[8px] text-[13px] font-semibold text-[#241065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
        >
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full">
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span>Back</span>
        </button>

        {/* Processing Card */}
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="flex w-[440px] max-w-[92vw] flex-col items-center justify-center gap-[28px] rounded-[28px] border border-[#E5E7EB] bg-[#F4F3FF] p-[28px] shadow-sm">
          {state === "submitting" && (
            <>
              <div className="flex w-[300px] flex-col items-center gap-[8px] text-center">
                <h1 className="w-full text-[17px] font-bold leading-[22px] text-[#3F1E94]">
                  Analyzing your measurements
                </h1>
                <p className="w-full text-[13px] font-medium leading-[18px] text-[#4B5563]">
                  Our AI is processing your photos to generate accurate
                  measurements. This can take up to a minute.
                </p>
              </div>

              <div className="relative h-[76px] w-[76px]">
                <div className="absolute inset-0 rounded-full border-[4px] border-[#BCB5FD]" />
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 90 90"
                >
                  <circle
                    cx="45"
                    cy="45"
                    r="41"
                    fill="none"
                    stroke="#241065"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="257.61"
                    strokeDashoffset={257.61 - (257.61 * progress) / 100}
                    className="transition-all duration-100 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[24px] font-bold leading-[29px] text-[#241065]">
                    {progress}%
                  </span>
                </div>
              </div>
            </>
          )}

          {state === "success" && (
            <>
              <div className="flex w-full flex-col items-center gap-[8px] text-center">
                <h1 className="text-[18px] font-bold text-[#3F1E94]">
                  Measurement complete
                </h1>
                <p className="text-[13px] font-medium text-[#4B5563]">{message}</p>
              </div>

              {measurements && (
                <div className="w-full rounded-xl border border-[#D8D6FE] bg-white p-4 text-[12px]">
                  {[
                    ["Shoulder width", measurements.shoulderWidthCm],
                    ["Arm length", measurements.armLengthCm],
                    ["Leg length", measurements.legLengthCm],
                    ["Chest", measurements.chestCircumferenceCm],
                    ["Waist", measurements.waistCircumferenceCm],
                    ["Hip", measurements.hipCircumferenceCm],
                  ]
                    .filter(([, v]) => v != null)
                    .map(([label, v]) => (
                      <div
                        key={label}
                        className="flex justify-between border-b border-[#F0EEFF] py-1.5 last:border-0"
                      >
                        <span className="text-[#4B5563]">{label}</span>
                        <span className="font-semibold text-[#241065]">
                          {Number(v).toFixed(1)} cm
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <p className="text-center text-[12px] text-[#6B7280]">
                You can close this page. The results have been shared with the
                vendor.
              </p>
            </>
          )}

          {state === "manual" && (
            <>
              <h1 className="text-[18px] font-bold text-[#3F1E94]">
                Sent for manual review
              </h1>
              <p className="text-center text-[13px] font-medium text-[#4B5563]">
                {message}
              </p>
              <p className="text-center text-[12px] text-[#6B7280]">
                You can close this page. The vendor will follow up.
              </p>
            </>
          )}

          {state === "retry" && (
            <>
              <h1 className="text-[18px] font-bold text-[#3F1E94]">
                Let&apos;s try that again
              </h1>
              <p className="text-center text-[13px] font-medium text-[#4B5563]">
                {message}
              </p>
              {attemptsRemaining != null && (
                <p className="text-center text-[12px] font-semibold text-[#6133DA]">
                  {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining
                </p>
              )}
              <button
                type="button"
                onClick={retryPhotos}
                className="flex h-[44px] w-full max-w-[320px] items-center justify-center rounded-lg bg-[#6133DA] text-[12px] font-semibold text-white transition hover:bg-[#4D26B5]"
              >
                Retake photos
              </button>
            </>
          )}

          {state === "error" && (
            <>
              <h1 className="text-[18px] font-bold text-[#3F1E94]">
                Something went wrong
              </h1>
              <p className="text-center text-[13px] font-medium text-[#4B5563]">
                {message}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex h-[44px] w-full max-w-[320px] items-center justify-center rounded-lg bg-[#6133DA] text-[12px] font-semibold text-white transition hover:bg-[#4D26B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 focus-visible:ring-offset-2"
              >
                Try again
              </button>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
