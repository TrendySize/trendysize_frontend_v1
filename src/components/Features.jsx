import {
  Link2,
  Users,
  Ruler,
  LayoutGrid,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Share links",
    description:
      "Generate a unique measurement link and share it. Anywhere.",
  },
  {
    icon: Users,
    title: "Customer records",
    description:
      "Keep every customer profile organized and easily accessible. In one place.",
  },
  {
    icon: Ruler,
    title: "Measurements",
    description:
      "Receive accurate body measurements with photos and store them. Securely.",
  },
  {
    icon: LayoutGrid,
    title: "Business Dashboard",
    description:
      "Track customers, links, measurements and recent activity. In real time.",
  },
];

export default function Features() {
  return (
    <section className="overflow-x-hidden bg-[#6133DA] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto flex max-w-[1376px] flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl text-center">
          <h2 className="text-[28px] font-bold leading-tight text-white sm:text-[36px] lg:text-[44px]">
            Everything you need to run your
            <br />
            fashion business digitally
          </h2>

          <p className="mt-5 text-[16px] leading-8 text-[#D8D6FE] sm:text-[18px]">
            Trendysize helps fashion businesses collect customer measurements, manage records and share measurement links, all from one secure workspace.
          </p>
        </div>

        <div className="mt-10 w-full rounded-lg bg-[#9B8CF9] px-3 py-4 sm:mt-14 lg:px-4">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={index} className="flex min-h-[180px] items-center rounded-lg bg-[#241065] px-6 py-4 sm:min-h-[240px] sm:py-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBE9FE]">
                      <Icon size={22} className="text-[#6133DA]" strokeWidth={2} />
                    </div>

                    <div>
                      <h3 className="mb-4 text-[20px] font-bold text-white">{item.title}</h3>
                      <p className="text-base leading-6 text-[#BCB5FD]">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}