
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Processing() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        const nextProgress = current + 1;

        if (nextProgress >= 100) {
          clearInterval(interval);
          return 100;
        }

        return nextProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        navigate("/measurements");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [progress, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">
      <div className="relative mx-auto min-h-screen w-full max-w-[1440px] px-[22px]">

        {/* Top Progress Indicator */}
        <div className="absolute left-[22px] right-[22px] top-[20px] flex h-[7px]">
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
          className="absolute left-[22px] top-[46px] flex h-[34px] w-[118px] items-center justify-center gap-[8px] rounded-[10px] border border-[#D1D5DB] bg-[#EBE9FE] px-[8px] text-[13px] font-semibold text-[#241065]"
        >
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </span>

          <span>Back</span>
        </button>

        {/* Processing Card */}
        <div className="absolute left-1/2 top-1/2 flex h-[380px] w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[32px] rounded-[28px] border border-[#E5E7EB] bg-[#F4F3FF] p-[28px] shadow-sm">

          {/* Heading */}
          <div className="flex w-[270px] flex-col items-center gap-[8px] text-center">
            <h1 className="w-full text-[17px] font-bold leading-[22px] text-[#3F1E94]">
              Analyzing your measurements
            </h1>

            <p className="w-full text-[13px] font-medium leading-[18px] text-[#4B5563]">
              Our AI is processing your photos to generate accurate
              measurements.
            </p>
          </div>

          {/* Loading Circle */}
          <div className="relative h-[76px] w-[76px]">

            {/* Circle Background */}
            <div className="absolute inset-0 rounded-full border-[4px] border-[#BCB5FD]" />

            {/* Animated Progress */}
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
                strokeDashoffset={
                  257.61 - (257.61 * progress) / 100
                }
                className="transition-all duration-100 ease-linear"
              />
            </svg>

            {/* Percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[24px] font-bold leading-[29px] text-[#241065]">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
