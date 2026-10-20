import { useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi";

const faqData = [
  {
    id: 1,
    question: "What is Trendysize?",
    answer:
      "Trendysize is a digital platform that helps tailors and fashion businesses collect, organize, and manage customer measurements digitally. It simplifies the process of gathering accurate measurements online through unique shareable links.",
  },
  {
    id: 2,
    question: "How do I get started?",
    answer:
      "Getting started is easy! Create a free account, generate your unique measurement link, and share it with your customers through WhatsApp, email, or any other communication channel. Customers can submit their measurements directly without needing an account.",
  },
  {
    id: 3,
    question: "Is my customer data secure?",
    answer:
      "Yes, absolutely. We use industry-standard encryption and security protocols to protect all customer data. Your measurements and customer information are stored securely in our encrypted database and are never shared with third parties.",
  },
  {
    id: 4,
    question: "Can I create custom measurement templates?",
    answer:
      "Yes! Trendysize comes with professionally designed templates for common clothing styles, but you can easily create unlimited custom templates tailored to your specific needs.",
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer:
      "We offer flexible pricing plans starting with a free tier. For premium features, we accept all major payment methods including credit cards, debit cards, and bank transfers.",
  },
  {
    id: 6,
    question: "Can I export my customer data?",
    answer:
      "Yes, you can export your customer measurements and records in various formats (CSV, PDF, etc.) for backup or integration with other tools you use in your business.",
  },
];

const FAQItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-[#E5E0FF]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left transition hover:text-[#6133DA]"
      >
        <h3 className="text-[16px] font-semibold text-[#241065] sm:text-[18px]">
          {item.question}
        </h3>
        <HiOutlineChevronDown
          size={24}
          className={`shrink-0 text-[#6133DA] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="pb-6">
          <p className="text-[14px] leading-[22px] text-[#4B5563] sm:text-[16px] sm:leading-[24px]">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [openId, setOpenId] = useState(1);

  return (
    <section className="bg-[#BCB5FD] py-16 sm:py-24 lg:py-28 w-full">
      <div className="mx-auto max-w-[1376px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-[14px] font-semibold uppercase tracking-wide text-[#241065] sm:text-[16px]">
            Frequently Asked Questions
          </p>

          <h2 className="mt-3 text-[28px] font-bold leading-tight text-[#241065] sm:text-[36px] lg:text-[44px] lg:leading-[52px]">
            Have Questions?
            <br />
            We Have Answers
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[14px] leading-[22px] text-[#4B5563] sm:text-[16px] sm:leading-[24px]">
            Find answers to common questions about Trendysize, our features, pricing, and how we help fashion businesses grow.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {faqData.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-[14px] text-[#241065] sm:text-[16px]">
            Can't find what you're looking for?
          </p>
          <a
            href="mailto:support@trendysize.com?subject=Support%20request"
            className="inline-block rounded-lg bg-[#6133DA] px-6 py-3 font-semibold text-white transition hover:bg-[#4C26C2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 focus-visible:ring-offset-2"
          >
            Contact Our Support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
