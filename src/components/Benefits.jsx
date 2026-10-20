import "react";
import {
  Clock3,
  FileText,
  MousePointerClick,
  BarChart3,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    title: "Saves time",
    description:
      "Collect and manage measurement digitally. No more back and forth",
    icon: Clock3,
  },
  {
    id: 2,
    title: "Stay organized",
    description:
      "Keep all your customers profile and measurements organized in one secure workspace",
    icon: FileText,
  },
  {
    id: 3,
    title: "Reduce errors",
    description:
      "Accurate digital measurements that helps you create better fitting outfits everytime",
    icon: MousePointerClick,
  },
  {
    id: 4,
    title: "Grow your business",
    description:
      "Serve more customers, build trust and grow your fashion business with ease.",
    icon: BarChart3,
  },
];

const BenefitCard = ({ benefit }) => {
  const Icon = benefit.icon;

  return (
    <div className="flex h-[240px] w-full items-center gap-3 rounded-lg bg-[#EBE9FE] px-3 py-4 sm:max-w-none md:max-w-[329px]">
      <div className="flex aspect-square h-12 w-12 items-center justify-center rounded-full bg-[#BCB5FD]">
        <Icon size={22} strokeWidth={1.8} className="text-[#6133DA]" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[20px] font-bold leading-6 text-[#241065]">{benefit.title}</h3>
        <p className="text-[16px] font-medium leading-[19px] text-[#6133DA]">{benefit.description}</p>
      </div>
    </div>
  );
};

const Benefits = () => {
  return (
    <section id="benefits" className="overflow-x-hidden bg-[#D8D6FE] text-slate-900 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1436px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-[700px] text-center">
          <p className="text-[18px] font-medium leading-6 text-[#241065] sm:text-[20px]">Benefits</p>
          <h2 className="mt-3 text-[32px] font-bold leading-tight sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
            <span className="text-[#241065]">Built to help your business</span>{" "}
            <span className="text-[#5B3DF5]">grow</span>
          </h2>
          <p className="mx-auto mt-8 max-w-[598px] text-[15px] font-medium leading-[19px] text-[#4B5563] sm:text-[16px]">
            Trendy size helps you save time, stay organized and deliver the best experience to your customers.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;