import  { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import comingSoonBanner from "../assets/images/coming.png";

const plans = [
  {
    id: 1,
    badge: "FREE",
    price: "₦0",
    duration: "/month",
    button: "Create free account",
    featured: false,
    features: [
      "Customer management",
      "Dashboard & analytics",
      "Secure cloud storage",
      "Email & WhatsApp support",
      "Receive measurements",
    ],
  },
  {
    id: 2,
    badge: "PRO",
    price: "₦7,500",
    duration: "/month",
    button: "Coming Soon",
    featured: true,
    features: [
      "Everything in Free",
      "Advanced analytics",
      "Unlimited measurements",
      "Priority support",
      "Export customer data",
      "Measurement history",
    ],
  },
  {
    id: 3,
    badge: "PREMIUM",
    price: "₦15,000",
    duration: "/month",
    button: "Coming Soon",
    featured: false,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Multiple staff accounts",
      "Custom branding",
      "API integration",
      "Dedicated support",
    ],
  },
];

const PricingCard = ({ plan }) => {
  return (
    <div
      className={`group
      w-full max-w-[440px]
      min-h-[460px]
      rounded-[12px]
      p-8
      transition-all
      duration-300
      hover:-translate-y-2
      hover:shadow-[0_30px_50px_rgba(36,16,101,0.25)]
      ${
        plan.featured
          ? "bg-[#6133DA] text-white"
          : "bg-[#D8D6FE] text-[#241065] dark:bg-slate-800 dark:text-slate-100"
      }`}
    >
      {/* Badge */}

      <div
        className={`inline-flex rounded-lg px-4 py-2 text-[10px] font-medium tracking-widest
        ${
          plan.featured
            ? "bg-white text-[#6133DA] dark:bg-slate-700 dark:text-white"
            : "bg-[#BCB5FD] text-[#6133DA] dark:bg-slate-700 dark:text-white"
        }`}
      >
        {plan.badge}
      </div>

      {/* Price */}

      <div className="mt-6 flex items-end">
        <h2 className="text-[42px] font-bold">
          {plan.price}
        </h2>

        <span
          className={`ml-2 text-sm ${
            plan.featured
              ? "text-white/80"
              : "text-[#4B5563]"
          }`}
        >
          {plan.duration}
        </span>
      </div>

      {/* Features */}

      <div className="mt-10 space-y-5">
        {plan.features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-3"
          >
            <CheckCircle2
              size={22}
              className={
                plan.featured
                  ? "text-white"
                  : "text-[#6133DA]"
              }
            />

            <p
              className={`text-[15px] font-medium ${
                plan.featured
                  ? "text-white"
                  : "text-[#4B5563]"
              }`}
            >
              {feature}
            </p>
          </div>
        ))}
      </div>

      <button
        className={`mt-10 w-full rounded-lg py-4 font-semibold transition
        ${
          plan.featured
            ? "bg-white text-[#6133DA] hover:bg-gray-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            : "bg-[#6133DA] text-white hover:bg-[#4E28C6]"
        }`}
      >
        {plan.button}
      </button>
    </div>
  );
};

const Pricing = () => {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <section className="overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1376px] px-4 sm:px-6 lg:px-8 xl:px-12">

        {/* Heading */}

        <div className="mx-auto max-w-[600px] text-center">

          <p className="text-[18px] font-medium text-[#241065] sm:text-[20px]">
            Pricing
          </p>

          <h2 className="mt-3 text-[32px] font-bold leading-tight sm:text-[40px] lg:text-[48px] lg:whitespace-nowrap">
            <span className="text-[#241065]">Simple,</span>{' '}
            <span className="text-[#6133DA]">Transparent Pricing</span>
          </h2>

          <p className="mt-6 text-[15px] text-[#4B5563] dark:text-slate-300 sm:mt-8 sm:text-[16px]">
            Start free and enjoy all the tools you need to manage customer measurements.
          </p>

        </div>

        {/* Pricing Cards */}

        <div className="mt-12 flex flex-col items-center justify-center gap-6 overflow-visible lg:mt-20 lg:flex-row lg:items-end">
          {plans.map((plan) => {
            const baseZ = plan.id === 1 ? "z-10" : plan.id === 2 ? "z-30" : "z-20";
            let zClass = baseZ;

            if (selected === plan.id) zClass = "z-50";
            else if (hovered === plan.id) zClass = "z-40";

            return (
              <div
                key={plan.id}
                className={`relative w-full max-w-[440px] ${plan.id !== 1 ? "lg:-ml-16" : ""} ${zClass} cursor-pointer`}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(plan.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelected(plan.id)}
              >
                <PricingCard plan={plan} />
              </div>
            );
          })}
        </div>
                {/* Coming Soon Banner */}

        <div className="mt-8 flex justify-center px-2">
          <img
            src={comingSoonBanner}
            alt="Premium and Pro plans coming soon"
            className="h-[50px] w-full max-w-[524px] object-contain"
          />
        </div>

      </div>
    </section>
  );
};

export default Pricing;