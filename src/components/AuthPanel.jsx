import heroImage from "../assets/images/hero.png";
import BrandLogo from "./BrandLogo";

export default function AuthPanel({ heroClassName = "" }) {
  return (
    <div className="relative overflow-hidden bg-[#6133DA] h-full">
      <img
        src={heroImage}
        alt="Trendysize hero"
        className={`absolute inset-0 h-full w-full object-cover object-left opacity-100 scale-90 -translate-x-20 -translate-y-10 ${heroClassName}`}
      />

      <div className="absolute inset-0 bg-[#6133DA]/20" />

      <div className="relative z-10 flex h-full flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center gap-0">
          <BrandLogo
            variant="light"
            alt="Trendysize logo"
            className="h-12 w-12 -mr-1"
          />

          <h1
            className="-ml-2 text-2xl font-bold tracking-normal text-white"
            style={{ fontFamily: "Agency FB, sans-serif" }}
          >
            TRENDY
            <span className="text-white">SIZE</span>
          </h1>
        </div>

        <div className="mt-28 max-w-105">
          <h2
            className="text-5xl font-bold leading-12 text-[#F4F3FF]"
            style={{ fontFamily: "SF Pro Display, sans-serif" }}
          >
            Collect and Manage
            <br />
            Customer
            <br />
            Measurements
            <br />
            <span className="text-[#FFA800]">Digitally</span>
          </h2>

          <p
            className="mt-8 max-w-90 text-xl leading-7 text-[#BCB5FD]"
            style={{ fontFamily: "SF Pro Display, sans-serif", fontWeight: 510 }}
          >
            Collect, organize and retrieve customer measurements from one simple workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
