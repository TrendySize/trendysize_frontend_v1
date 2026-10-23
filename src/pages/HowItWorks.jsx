import {
  ArrowLeft,
  Camera,
  Sun,
  Shirt,
  UserRound,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MeasurementBrand from "../components/MeasurementBrand";

export default function HowItWorks() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const nextStep = token ? `/front-photo?token=${encodeURIComponent(token)}` : "/front-photo";

  return (
    <div className="relative min-h-screen bg-transparent px-8 py-6 text-[var(--tk-ink)]">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1440px] flex-col">

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#A9A6B5]">
          <div className="h-full w-[25%] bg-[#6133DA]" />
        </div>

        {/* ==================================================
            BACK
        ================================================== */}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[40px] w-[110px] items-center justify-center gap-2 rounded-lg border border-[#D8D6FE] bg-[#EBE9FE] text-sm font-medium text-[#241065] transition hover:bg-[#D8D6FE]"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </div>

        {/* ==================================================
            HEADING
        ================================================== */}

        <div className="mt-8 flex flex-col items-center text-center">
          <MeasurementBrand />

          <h1 className="mt-4 text-3xl font-bold text-[#241065]">
            How it works
          </h1>

          <p className="mt-2 text-sm text-[#6133DA]">
            Follow these simple steps for the most accurate measurements
          </p>
        </div>

        {/* ==================================================
            STEPS
        ================================================== */}

        <div className="mx-auto mt-8 w-full max-w-[700px] rounded-xl bg-[#EBE9FE] px-8 py-7">

          {/* TAKE CLEAR PHOTOS */}

          <div className="flex items-center gap-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center text-[#6133DA]">
              <Camera size={30} strokeWidth={1.7} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#241065]">
                Take clear photos
              </h3>

              <p className="mt-1 text-xs leading-4 text-[#6B7280]">
                We’ll need front and side photos
              </p>
            </div>
          </div>

          {/* STAND STRAIGHT */}

          <div className="mt-7 flex items-center gap-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center text-[#6133DA]">
              <UserRound size={30} strokeWidth={1.7} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#241065]">
                Stand straight
              </h3>

              <p className="mt-1 text-xs leading-4 text-[#6B7280]">
                Stand naturally with your arms slightly away from your sides
              </p>
            </div>
          </div>

          {/* WEAR FITTED CLOTHING */}

          <div className="mt-7 flex items-center gap-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center text-[#6133DA]">
              <Shirt size={30} strokeWidth={1.7} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#241065]">
                Wear fitted clothing
              </h3>

              <p className="mt-1 text-xs leading-4 text-[#6B7280]">
                Fitted clothing or underwear gives the AI a clearer outline
              </p>
            </div>
          </div>

          {/* GOOD LIGHTING */}

          <div className="mt-7 flex items-center gap-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center text-[#6133DA]">
              <Sun size={30} strokeWidth={1.7} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#241065]">
                Good lighting
              </h3>

              <p className="mt-1 text-xs leading-4 text-[#6B7280]">
                Face a window or light. Avoid strong shadows behind you
              </p>
            </div>
          </div>

        </div>

        {/* ==================================================
            CONTINUE
        ================================================== */}

        <div className="mt-auto pb-10 pt-10">
          <p className="mx-auto mb-4 max-w-[430px] text-center text-xs leading-5 text-[var(--tk-ink-muted)]">
            These photos are used only for your measurements and are shared only
            with the vendor who sent this link.
          </p>

          <button
            type="button"
            onClick={() => navigate(nextStep)}
            className="mx-auto flex h-[48px] w-full max-w-[430px] items-center justify-center rounded-lg bg-[#6133DA] text-sm font-semibold text-white transition hover:bg-[#4D26B5]"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}