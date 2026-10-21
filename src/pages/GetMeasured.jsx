
import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, Ruler } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GetMeasured() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("1"); // 1 = Female, 0 = Male
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [error, setError] = useState("");

  // The measurement token travels in the shared link (?token=...).
  // Persist it so the final submit step can read it.
  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("trendySize_measure_token", token);
    }
  }, [params]);

  const handleContinue = (event) => {
    event.preventDefault();

    const value = Number(height);

    if (!firstName.trim() && !lastName.trim()) {
      setError("Please enter your name so the vendor knows who this is for.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number so the vendor can reach you.");
      return;
    }

    if (!height.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Please enter your height so we can calibrate your measurements.");
      return;
    }

    if (heightUnit === "ft" && (value < 3 || value > 8)) {
      setError("Please enter a height between 3 and 8 feet.");
      return;
    }

    if (heightUnit === "cm" && (value < 90 || value > 250)) {
      setError("Please enter a height between 90 and 250 cm.");
      return;
    }

    setError("");

    // The backend submit contract accepts photos, an optional height, and the
    // customer's details (used to fill in the placeholder customer created at
    // link-generation time).
    localStorage.setItem(
      "trendySize_customer_details",
      JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender: Number(gender),
        height: height.trim(),
        heightUnit,
      })
    );

    navigate("/how-it-works");
  };

  return (
    <div className="relative min-h-screen bg-transparent px-4 py-3 text-[var(--tk-ink)]">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1180px] flex-col">

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#A9A6B5]">
          <div className="h-full w-[13%] bg-[#6133DA]" />
        </div>

        {/* ==================================================
            BACK
        ================================================== */}

        <div className="mt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[32px] items-center justify-center gap-2 rounded-lg border border-[#D8D6FE] bg-[#EBE9FE] px-4 text-[12px] font-medium text-[#241065] transition hover:bg-[#D8D6FE]"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* ==================================================
            HEADING
        ================================================== */}

        <div className="mt-5 text-center">
          <h1 className="text-[26px] font-bold text-[#241065]">
            Let’s get your details
          </h1>

          <p className="mx-auto mt-1 max-w-[500px] text-[12px] leading-5 text-[#6B7280]">
            Tell us who you are and your height, then capture your photos.
            We’ll keep your measurements private and share them only with the vendor.
          </p>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleContinue}
          className="mx-auto mt-5 w-full max-w-[720px]"
        >
          <div className="rounded-xl border border-[#D8D6FE] bg-white p-6 shadow-sm">

            {/* ==================================================
                CUSTOMER DETAILS - REQUIRED
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-[13px] font-semibold text-[#241065]"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="e.g. Chukwuma"
                  maxLength={60}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-[13px] text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-[13px] font-semibold text-[#241065]"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="e.g. Johnson"
                  maxLength={60}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-[13px] text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="mb-2 block text-[13px] font-semibold text-[#241065]"
                >
                  Phone number
                  <span className="ml-1 font-normal text-[#6B7280]">(required)</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="e.g. +2348012345678"
                  maxLength={20}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-[13px] text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-[13px] font-semibold text-[#241065]"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-[13px] text-[#241065] outline-none transition focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                >
                  <option value="1">Female</option>
                  <option value="0">Male</option>
                </select>
              </div>

            </div>

            <div className="mt-6 border-t border-[#EEF0F6] pt-5">

            {/* ==================================================
                HEIGHT - REQUIRED
            ================================================== */}

            <div className="mt-1">
              <label
                htmlFor="height"
                className="mb-2 block text-[13px] font-semibold text-[#241065]"
              >
                Height
                <span className="ml-1 font-normal text-[#6B7280]">
                  (required)
                </span>
              </label>

              <div className="flex gap-2">

                <div className="relative min-w-0 flex-1">
                  <Ruler
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#6133DA]"
                  />

                  <input
                    id="height"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    placeholder="Enter your height"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "height-error" : undefined}
                    className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] pl-11 pr-4 text-[13px] text-[#241065] outline-none transition placeholder:text-[#6B7280] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setHeightUnit("cm")}
                  aria-pressed={heightUnit === "cm"}
                  className={`h-[46px] w-[55px] rounded-lg text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 ${
                    heightUnit === "cm"
                      ? "bg-[#6133DA] text-white"
                      : "border border-[#D8D6FE] bg-[#F4F3FF] text-[#4B5563]"
                  }`}
                >
                  cm
                </button>

                <button
                  type="button"
                  onClick={() => setHeightUnit("ft")}
                  aria-pressed={heightUnit === "ft"}
                  className={`h-[46px] w-[55px] rounded-lg text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 ${
                    heightUnit === "ft"
                      ? "bg-[#6133DA] text-white"
                      : "border border-[#D8D6FE] bg-[#F4F3FF] text-[#4B5563]"
                  }`}
                >
                  ft
                </button>

              </div>

              <p
                id="height-error"
                role="alert"
                className={`mt-2 text-[12px] font-medium text-[#B91C1C] ${
                  error ? "" : "hidden"
                }`}
              >
                {error}
              </p>
            </div>

            </div>

            {/* ==================================================
                PRIVACY
            ================================================== */}

            <div className="mt-5 flex min-h-[48px] items-center gap-3 rounded-lg bg-[#EBE9FE] px-4">

              <LockKeyhole
                size={18}
                aria-hidden="true"
                className="shrink-0 text-[#6133DA]"
              />

              <p className="text-[11px] leading-4 text-[#241065]">
                Your photos and height are private and will only
                be visible to the vendor.
              </p>

            </div>

            {/* ==================================================
                CONTINUE
            ================================================== */}

            <button
              type="submit"
              className="mt-6 flex h-[46px] w-full items-center justify-center rounded-lg bg-[#6133DA] text-[13px] font-semibold text-white transition hover:bg-[#4D26B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 focus-visible:ring-offset-2"
            >
              Continue
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}

