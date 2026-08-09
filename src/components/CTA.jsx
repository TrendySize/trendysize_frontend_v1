import { useNavigate } from "react-router-dom";
import "react";
import ctaImage from "../assets/images/CTA.png";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-[520px] w-full overflow-hidden bg-no-repeat bg-cover dark:bg-slate-950 sm:min-h-[640px]"
      style={{
        backgroundImage: `url(${ctaImage})`,
        backgroundPosition: '100% center',
      }}
    >
      {/* Purple Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90.19deg, rgba(97,51,218,0.96) 34%, rgba(244,243,255,0) 98.63%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center justify-center px-4 py-12 sm:justify-start sm:px-6 lg:px-12">
        <div className="flex w-full max-w-[760px] flex-col items-center text-center sm:items-start sm:text-left">
          <h2 className="text-[28px] font-bold leading-tight text-[#F4F3FF] sm:text-[44px] lg:text-[56px] lg:leading-[67px]">
            Ready to Modernize your
            <br />
            fashion business?
          </h2>

          <p className="mt-5 max-w-[724px] text-[16px] font-medium leading-7 text-[#EBE9FE] sm:mt-8 sm:text-[24px] lg:mt-10 lg:text-[32px] lg:leading-[39px]">
            Join Trendysize today and start connecting with your customers
            digitally.
          </p>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="mt-8 flex h-[50px] w-full max-w-[320px] items-center justify-center rounded-[8px] bg-[#F4F3FF] text-[16px] font-bold text-[#6133DA] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 sm:mt-10 lg:mt-14 lg:h-[54px] lg:w-[518px] lg:text-[20px]"
          >
            Create free account
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;