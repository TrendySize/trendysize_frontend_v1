import heroImage from "../assets/images/hero.png";
import logo from "../assets/images/nav.png";

export default function AuthPanel() {
  return (
    <div className="relative overflow-hidden bg-[#6133DA] min-h-170 lg:min-h-screen">
      <img
        src={heroImage}
        alt="Trendysize hero"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />

      <div className="absolute inset-0 bg-[#6133DA]/30" />

      <div className="relative z-10 flex h-full flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Trendysize logo"
            className="h-16 w-16 rounded-xl bg-white p-2"
          />

          <h1
            className="text-[24px] font-bold tracking-wide text-[#241065]"
            style={{ fontFamily: "Agency FB, sans-serif" }}
          >
            TRENDYSIZE
          </h1>
        </div>

        <div className="mt-28 max-w-105">
          <h2
            className="text-[40px] font-bold leading-12 text-[#F4F3FF]"
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
            className="mt-8 max-w-90 text-[20px] leading-7 text-[#BCB5FD]"
            style={{ fontFamily: "SF Pro Display, sans-serif", fontWeight: 510 }}
          >
            Collect, organize and retrieve customer measurements from one simple workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
