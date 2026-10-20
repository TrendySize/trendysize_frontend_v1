
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "flag-icons/css/flag-icons.min.css";
import "./GetMeasured.css";

const PhoneInput = PhoneInputModule.default ?? PhoneInputModule;

export default function GetMeasured() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const phoneInputRef = useRef(null);

  // The measurement token travels in the shared link (?token=...).
  // Persist it so the final submit step can read it.
  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("trendySize_measure_token", token);
    }
  }, [params]);

  useEffect(() => {
    const phoneInput = phoneInputRef.current;

    if (!phoneInput) return;

    const applySvgFlags = () => {
      phoneInput.querySelectorAll(".flag").forEach((flag) => {
        const countryCode = Array.from(flag.classList).find((name) =>
          /^[a-z]{2}$/.test(name)
        );

        if (!countryCode) return;

        flag.classList.add("fi", `fi-${countryCode}`);
        flag.classList.remove("flag");
      });
    };

    applySvgFlags();

    const observer = new MutationObserver(applySvgFlags);

    observer.observe(phoneInput, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const handleContinue = (event) => {
    event.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    const customerDetails = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      height: height.trim(),
      heightUnit,
    };

    localStorage.setItem(
      "trendySize_customer_details",
      JSON.stringify(customerDetails)
    );

    navigate("/how-it-works");
  };

  return (
    <div className="min-h-screen bg-[#F4F3FF] px-4 py-3 text-[#241065]">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1180px] flex-col">

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
            We’ll use this information to save your measurements
            securely with the vendor.
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
                FULL NAME
            ================================================== */}

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-[13px] font-semibold text-[#241065]"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#6133DA]"
                />

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="h-[46px] w-full rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] pl-11 pr-4 text-[13px] text-[#241065] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/10"
                />
              </div>
            </div>

            {/* ==================================================
                PHONE NUMBER
            ================================================== */}

            <div className="mt-5" ref={phoneInputRef}>
              <label
                htmlFor="phone"
                className="mb-2 block text-[13px] font-semibold text-[#241065]"
              >
                Phone Number
              </label>

              <PhoneInput
                containerClass="get-measured-phone"
                searchClass="country-search-control"
                country="ng"
                value={phone}
                onChange={(value) => setPhone(value)}
                enableSearch
                searchPlaceholder="Search country..."
                countryCodeEditable
                disableSearchIcon={false}
                preferredCountries={[
                  "ng",
                  "gb",
                  "us",
                  "ca",
                  "gh",
                  "za",
                  "ae",
                ]}
                inputProps={{
                  id: "phone",
                  name: "phone",
                  required: true,
                  autoComplete: "tel",
                }}
                placeholder="Enter your phone number"
                containerStyle={{
                  width: "100%",
                }}
                inputStyle={{
                  width: "100%",
                  height: "46px",
                  fontSize: "13px",
                  color: "#241065",
                  backgroundColor: "#F8F7FF",
                  border: "1px solid #D8D6FE",
                  borderRadius: "8px",
                }}
                buttonStyle={{
                  height: "46px",
                  backgroundColor: "#EBE9FE",
                  border: "1px solid #D8D6FE",
                  borderRadius: "8px 0 0 8px",
                }}
                dropdownStyle={{
                  width: "320px",
                  maxHeight: "280px",
                  fontSize: "12px",
                }}
                searchStyle={{
                  width: "calc(100% - 20px)",
                  height: "34px",
                  margin: "8px 10px",
                  padding: "0 10px",
                  border: "1px solid #D8D6FE",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#241065",
                  outline: "none",
                }}
              />
            </div>

            {/* ==================================================
                HEIGHT - OPTIONAL
            ================================================== */}

            <div className="mt-5">
              <label
                htmlFor="height"
                className="mb-2 block text-[13px] font-semibold text-[#241065]"
              >
                Height
                <span className="ml-1 font-normal text-[#9CA3AF]">
                  (Optional)
                </span>
              </label>

              <div className="flex gap-2">

                <input
                  id="height"
                  type="number"
                  min="1"
                  value={height}
                  onChange={(event) =>
                    setHeight(event.target.value)
                  }
                  placeholder="Enter your height"
                  className="h-[46px] min-w-0 flex-1 rounded-lg border border-[#D8D6FE] bg-[#F8F7FF] px-4 text-[13px] text-[#241065] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/10"
                />

                <button
                  type="button"
                  onClick={() => setHeightUnit("cm")}
                  className={`h-[46px] w-[55px] rounded-lg text-[12px] font-semibold transition ${
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
                  className={`h-[46px] w-[55px] rounded-lg text-[12px] font-semibold transition ${
                    heightUnit === "ft"
                      ? "bg-[#6133DA] text-white"
                      : "border border-[#D8D6FE] bg-[#F4F3FF] text-[#4B5563]"
                  }`}
                >
                  ft
                </button>

              </div>
            </div>

            {/* ==================================================
                PRIVACY
            ================================================== */}

            <div className="mt-5 flex min-h-[48px] items-center gap-3 rounded-lg bg-[#EBE9FE] px-4">

              <LockKeyhole
                size={18}
                className="shrink-0 text-[#6133DA]"
              />

              <p className="text-[11px] leading-4 text-[#241065]">
                Your information is private and will only be
                visible to the vendor.
              </p>

            </div>

            {/* ==================================================
                CONTINUE
            ================================================== */}

            <button
              type="submit"
              className="mt-6 flex h-[46px] w-full items-center justify-center rounded-lg bg-[#6133DA] text-[13px] font-semibold text-white transition hover:bg-[#4D26B5]"
            >
              Continue
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}

