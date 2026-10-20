
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/images/hero.png";
import floatingImage from "../assets/images/floating-card.png";
import heroIcon from "../assets/icons/icon.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative overflow-x-hidden overflow-y-hidden bg-[#F4F3FF] pt-20 lg:pt-0 lg:h-screen max-[380px]:pt-16"
    >
      <img
        src={heroImage}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="pointer-events-none absolute left-1/2 top-0 w-[400px] -translate-x-1/2 select-none opacity-100 sm:-top-[80px] sm:w-[500px] lg:left-auto lg:translate-x-0 lg:-left-10 lg:-top-[120px] lg:w-[664px] max-[380px]:w-[340px]"
      />

      <div className="relative mx-auto flex h-auto max-w-[1440px] flex-col px-4 pb-6 pt-12 sm:px-6 sm:pb-12 sm:pt-16 lg:h-auto lg:min-h-screen lg:justify-center lg:pb-0 lg:pt-24 lg:px-8 xl:px-12 max-[380px]:px-3 max-[380px]:pb-3 max-[380px]:pt-8">
        <div className="flex flex-col justify-start lg:w-[650px]">

          {/* HERO ICON */}
          <div className="mb-8 mt-2 flex w-full justify-center lg:absolute lg:left-1/2 lg:top-32 lg:-translate-x-1/2 lg:mt-0 max-[380px]:mb-5 max-[380px]:mt-0">
            <img
              src={heroIcon}
              alt="Tailor taking a customer's body measurement with the Trendysize app"
              fetchPriority="high"
              decoding="async"
              className="h-auto w-[320px] sm:w-[360px] lg:w-[480px] max-[380px]:w-[270px]"
            />
          </div>

          {/* HERO TEXT */}
          <div className="z-20 max-w-full text-center sm:text-left">

            <h2
              className="text-[28px] font-bold leading-tight text-[#241065] sm:text-[36px] lg:text-[42px] lg:leading-[50px] max-[380px]:text-[24px] max-[380px]:leading-[30px]"
              style={{ fontFamily: "SF Pro Display" }}
            >
              Collect and Manage
              <br />
              Customer Measurements
              <br />
              <span className="text-[#6133DA]">Digitally</span>
            </h2>

            <p
              className="mx-auto mt-5 max-w-[820px] text-[16px] leading-7 text-[#4B5563] sm:mx-0 sm:mt-8 sm:text-[20px] lg:mt-10 lg:text-[24px] lg:leading-[32px] max-[380px]:mt-3 max-[380px]:text-[14px] max-[380px]:leading-5 sm:hidden"
              style={{ fontFamily: "SF Pro Display" }}
            >
              Collect, organize, and retrieve customer measurements from one simple workspace built for quick fit sessions and smoother follow-ups.
            </p>

            <p
              className="mx-auto mt-5 hidden max-w-[820px] text-[16px] leading-7 text-[#4B5563] sm:mx-0 sm:mt-8 sm:block sm:text-[20px] lg:mt-10 lg:text-[24px] lg:leading-[32px]"
              style={{ fontFamily: "SF Pro Display" }}
            >
              Collect, organize and retrieve customer measurements from one simple workspace
            </p>

            {/* CTA BUTTONS */}
            <div className="mt-10 flex flex-col gap-3 sm:mt-10 sm:flex-row lg:mt-16 max-[380px]:mt-6 max-[380px]:gap-2">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="h-[48px] w-full rounded-lg bg-[#6133DA] font-medium text-white transition hover:bg-[#4D26B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 focus-visible:ring-offset-2 sm:w-[220px] max-[380px]:h-[43px] max-[380px]:text-[13px]"
              >
                Create free account
              </button>

              <a
                href="#how-it-works"
                className="flex h-[48px] w-full items-center justify-center rounded-lg border border-[#6133DA] bg-transparent font-medium text-[#4C2BB0] transition hover:bg-[#EBE9FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 sm:w-[220px] max-[380px]:h-[43px] max-[380px]:text-[13px]"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>

        {/* FLOATING IMAGE */}
        <div className="mt-2 flex flex-grow items-start justify-center sm:mt-10 lg:absolute lg:right-0 lg:top-2/3 lg:mt-0 lg:flex-grow-0 lg:-translate-y-1/2 max-[380px]:mt-0">
          <img
            src={floatingImage}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="z-10 h-[90vw] w-[125vw] max-h-[760px] max-w-[760px] rotate-[-8deg] drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] object-contain sm:h-[560px] sm:w-[560px] lg:h-[760px] lg:w-[760px] max-[380px]:h-[75vw] max-[380px]:w-[95vw]"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

