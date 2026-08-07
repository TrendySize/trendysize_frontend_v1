import "react";

const steps = [
  {
    number: "1",
    title: "Create your free account",
    description:
      "Get started by creating your free TrendySize account. It only takes a few minutes to begin managing your customer measurements digitally.",
  },
  {
    number: "2",
    title: "Generate your measurement link",
    description:
      "Create a unique measurement link for your business. Each link provides customers with a simple and secure way to submit their body measurements online.",
  },
  {
    number: "3",
    title: "Share your link anywhere",
    description:
      "Share your measurement link with customers through WhatsApp, Instagram, Facebook, TikTok, SMS, or email. Customers can open the link directly from their browser—no account needed.",
  },
  {
    number: "4",
    title: "Receive and manage measurements",
    description:
      "As customers submit their measurements, every record is securely stored and automatically organized in your dashboard for easy access, tracking, and future reference.",
  },
];

const StepCard = ({ step }) => {
  return (
    <div className="relative w-full max-w-[520px] mx-auto xl:mx-0">
      {/* Number Badge */}
      <div className="absolute -top-5 left-16 z-20 flex h-10 w-10 items-center justify-center rounded-[4px] border-4 border-[#BCB5FD] bg-[#241065]">
        <span className="text-[16px] font-semibold text-[#BCB5FD]">
          {step.number}
        </span>
      </div>

      {/* Card */}
      <div
        className="
          h-full
          rounded-[8px]
          bg-[#BCB5FD]
          p-6
          pt-14
          shadow-[0_24px_24px_rgba(36,16,101,0.25)]
        "
      >
        <div className="flex h-full flex-col">
          <h3
            className="
              text-[18px]
              font-bold
              leading-6
              text-[#241065]
              lg:text-[20px]
            "
          >
            {step.title}
          </h3>

          <p
            className="
              mt-4
              text-[15px]
              leading-7
              text-[#4B5563]
              lg:text-[16px]
              lg:leading-[28px]
            "
          >
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  return (
    <section className="bg-white px-6 py-16 lg:px-8 xl:px-0 xl:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center">
          <span
            className="
              text-sm
              font-semibold
              uppercase
              tracking-wider
              text-[#5B3DF5]
              lg:text-base
            "
          >
            How it works
          </span>

          <h2
            className="
              mt-3
              text-3xl
              font-bold
              leading-tight
              sm:text-4xl
              lg:text-[48px]
              lg:leading-[56px]
            "
          >
            <span className="text-[#241065]">Simple steps.</span>{" "}
            <span className="text-[#5B3DF5]">Powerful results</span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-[598px]
              text-[15px]
              leading-7
              text-[#4B5563]
              lg:mt-8
              lg:text-[16px]
              lg:leading-[19px]
            "
          >
            From creating your account to managing customer measurements, we
            make it effortless.
          </p>
        </div>

        {/* Mobile & Tablet */}
        <div className="mt-16 grid gap-16 md:grid-cols-2 xl:hidden">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>

        {/* Desktop (UNCHANGED) */}
        <div className="hidden xl:block">
          {/* First Row */}
          <div className="mt-20 flex justify-between gap-16">
            <StepCard step={steps[0]} />
            <StepCard step={steps[1]} />
          </div>

          {/* Second Row */}
          <div className="mt-20 flex justify-center gap-[128px]">
            <StepCard step={steps[2]} />
            <StepCard step={steps[3]} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;