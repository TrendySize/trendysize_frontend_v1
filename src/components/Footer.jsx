import "react";
import logoSrc from "../assets/images/nav.png";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

const productLinks = [
  "Features",
  "How it works",
  "Benefits",
  "Pricing",
];

const resourceLinks = [
  "Help Center",
  "Blog",
  "FAQs",
  "Contact us",
];

const companyLinks = [
  "About us",
  "Our Mission",
  "Terms of Service",
];

const Footer = () => {
  return (
    <footer className="w-full overflow-x-hidden bg-white px-4 pb-14 pt-16 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row lg:justify-between lg:items-start lg:gap-14">

        {/* Left Section */}
        <div className="w-full text-center lg:text-left lg:w-auto lg:max-w-[235px]">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <img
              src={logoSrc}
              alt="Trendysize Logo"
              className="h-8 w-8"
            />

            <h3
              className="font-bold tracking-wide text-[#241065]"
              style={{ fontFamily: "Agency FB", fontSize: "15px" }}
            >
              TRENDYSIZE
            </h3>
          </div>

          {/* Description */}
          <p className="mt-3 text-[13px] font-medium leading-[18px] text-[#9B8CF9] sm:text-[14px] sm:leading-[20px] lg:text-left">
            The simple way for tailors and fashion businesses to collect,
            organize and manage customer measurements digitally.
          </p>

          {/* Social Icons */}
          <div className="mt-5 flex items-center justify-center gap-3 lg:justify-start">

            <a href="#" className="text-[#7A5DF5] transition hover:text-[#6133DA]">
              <FaFacebookF size={22} />
            </a>

            <a href="#" className="text-[#7A5DF5] transition hover:text-[#6133DA]">
              <FaInstagram size={22} />
            </a>

            <a href="#" className="text-[#7A5DF5] transition hover:text-[#6133DA]">
              <FaLinkedinIn size={22} />
            </a>

            <a href="#" className="text-[#7A5DF5] transition hover:text-[#6133DA]">
              <FaTwitter size={22} />
            </a>

          </div>
        </div>

        {/* Right Section */}
        <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Product */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="text-[13px] font-semibold uppercase text-[#6133DA] sm:text-[14px]">
              PRODUCT
            </h4>

            {productLinks.map((item) => {
            const hrefMap = {
              Features: "/#features",
              "How it works": "/#how-it-works",
              Benefits: "/#benefits",
              Pricing: "/#pricing",
            };

            return (
              <a
                key={item}
                href={hrefMap[item] || "/#home"}
                className="text-[13px] font-medium text-[#4B5563] transition-colors duration-300 hover:text-[#6133DA] sm:text-[14px]"
              >
                {item}
              </a>
            );
          })}
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="text-[13px] font-semibold uppercase text-[#6133DA] sm:text-[14px]">
              RESOURCES
            </h4>

            {resourceLinks.map((item) => {
            const hrefMap = {
              "Help Center": "/#faq",
              Blog: "/signup",
              FAQs: "/#faq",
              "Contact us": "mailto:support@trendysize.com",
            };

            return (
              <a
                key={item}
                href={hrefMap[item] || "/signup"}
                className="text-[13px] font-medium text-[#4B5563] transition-colors duration-300 hover:text-[#6133DA] sm:text-[14px]"
              >
                {item}
              </a>
            );
          })}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="text-[13px] font-semibold uppercase text-[#6133DA] sm:text-[14px]">
              COMPANY
            </h4>

            {companyLinks.map((item) => (
              <a
                key={item}
                href="/signup"
                className="text-[13px] font-medium text-[#4B5563] transition-colors duration-300 hover:text-[#6133DA] sm:text-[14px]"
              >
                {item}
              </a>
            ))}
          </div>

        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl px-2 sm:px-8">
        <div className="border-t border-slate-200 pt-8 text-center">
          <p className="inline-flex h-auto items-center text-[11px] font-normal leading-[15px] text-[#6133DA] sm:text-[12px]">
            © 2026 Trendysize. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;