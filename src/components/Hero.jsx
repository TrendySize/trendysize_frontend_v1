import heroImage from "../assets/images/hero.png";
import floatingImage from "../assets/images/floating-card.png";
import heroIcon from "../assets/icons/icon.png";

const Hero = () => {
  return (
    <section className="relative overflow-x-hidden overflow-y-hidden bg-[#F4F3FF] pt-20 lg:pt-0 lg:h-screen">
      <img src={heroImage} alt="hero background" className="pointer-events-none absolute left-1/2 top-0 w-[400px] -translate-x-1/2 select-none opacity-100 sm:-top-[80px] sm:w-[500px] lg:left-auto lg:translate-x-0 lg:-left-10 lg:-top-[120px] lg:w-[664px]" />

      <div className="relative mx-auto flex h-auto max-w-[1440px] flex-col px-4 pb-6 pt-12 sm:px-6 sm:pb-12 sm:pt-16 lg:h-auto lg:min-h-screen lg:justify-center lg:pb-0 lg:pt-24 lg:px-8 xl:px-12">
        <div className="flex flex-col justify-start lg:w-[650px]">
          <div className="mb-8 mt-2 flex w-full justify-center lg:absolute lg:left-1/2 lg:top-32 lg:-translate-x-1/2 lg:mt-0">
            <img src={heroIcon} alt="Hero image" className="h-auto w-[320px] sm:w-[360px] lg:w-[480px]" />
          </div>

          <div className="z-20 max-w-full text-center sm:text-left">
            <h2 className="text-[28px] font-bold leading-tight text-[#241065] sm:text-[36px] lg:text-[42px] lg:leading-[50px]" style={{ fontFamily: "SF Pro Display" }}>
              Collect and Manage
              <br />
              Customer Measurements
              <br />
              <span className="text-[#6133DA]">Digitally</span>
            </h2>

            <p className="mx-auto mt-5 max-w-[820px] text-[16px] leading-7 text-[#4B5563] sm:mx-0 sm:mt-8 sm:text-[20px] lg:mt-10 lg:text-[24px] lg:leading-[32px]" style={{ fontFamily: "SF Pro Display" }}>
              Collect, organize and retrieve customer measurements from one simple workspace
            </p>

            <div className="mt-24 flex flex-col gap-3 sm:mt-10 sm:flex-row lg:mt-16">
              <button className="h-[48px] w-full rounded-lg bg-[#6133DA] font-medium text-white sm:w-[220px]">
                Create free account
              </button>
              <button className="h-[48px] w-full rounded-lg border border-[#6133DA] bg-transparent font-medium text-[#6133DA] sm:w-[220px]">
                Learn more
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-grow items-end justify-center sm:mt-10 lg:absolute lg:right-0 lg:top-2/3 lg:mt-0 lg:flex-grow-0 lg:-translate-y-1/2">
          <img src={floatingImage} alt="floating card" className="z-10 h-[92vw] w-[92vw] max-h-[620px] max-w-[620px] rotate-[-8deg] drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] object-contain sm:h-[520px] sm:w-[520px] lg:h-[690px] lg:w-[690px]" />
        </div>
      </div>
    </section>
  );
};

export default Hero;