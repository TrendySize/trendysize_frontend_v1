import "react";
import BrandLogo from "./BrandLogo";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

const productLinks = [
  { label: "Features", to: "/#features" },
  { label: "How it works", to: "/#how-it-works" },
  { label: "Benefits", to: "/#benefits" },
  { label: "Pricing", to: "/#pricing" },
];

const resourceLinks = [
  { label: "Help Center", to: "/help-center" },
  { label: "FAQs", to: "/#faq" },
  { label: "Contact us", to: "/contact-support" },
];

const companyLinks = [
  { label: "Sign in", to: "/signin" },
  { label: "Get started", to: "/signup" },
  { label: "How it works", to: "/#how-it-works" },
];

const Footer = () => {
  return (
    <footer className="w-full overflow-x-hidden bg-white px-4 pb-14 pt-16 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row lg:justify-between lg:items-start lg:gap-14">

        {/* Left Section */}
        <div className="w-full text-center lg:text-left lg:w-auto lg:max-w-[235px]">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <BrandLogo
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
          <p className="mt-3 text-sm font-medium leading-[18px] text-[#9B8CF9] sm:text-sm sm:leading-[20px] lg:text-left">
            The simple way for tailors and fashion businesses to collect,
            organize and manage customer measurements digitally.
          </p>

          {/* Social Icons */}
          <div className="mt-5 flex items-center justify-center gap-3 lg:justify-start">

            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Trendysize on Facebook" className="text-[#6D4CE0] transition hover:text-[#4C2BB0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 rounded">
              <FaFacebookF size={22} aria-hidden="true" />
            </a>

            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Trendysize on Instagram" className="text-[#6D4CE0] transition hover:text-[#4C2BB0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 rounded">
              <FaInstagram size={22} aria-hidden="true" />
            </a>

            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Trendysize on LinkedIn" className="text-[#6D4CE0] transition hover:text-[#4C2BB0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 rounded">
              <FaLinkedinIn size={22} aria-hidden="true" />
            </a>

            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Trendysize on X (Twitter)" className="text-[#6D4CE0] transition hover:text-[#4C2BB0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 rounded">
              <FaTwitter size={22} aria-hidden="true" />
            </a>

          </div>
        </div>

        {/* Right Section */}
        <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Product */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="text-sm font-semibold uppercase text-[#4C2BB0] sm:text-sm">
              PRODUCT
            </h4>

            {productLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-[#4B5563] transition-colors duration-300 hover:text-[#6133DA] sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="text-sm font-semibold uppercase text-[#4C2BB0] sm:text-sm">
              RESOURCES
            </h4>

            {resourceLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-[#4B5563] transition-colors duration-300 hover:text-[#6133DA] sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="text-sm font-semibold uppercase text-[#4C2BB0] sm:text-sm">
              COMPANY
            </h4>

            {companyLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-[#4B5563] transition-colors duration-300 hover:text-[#6133DA] sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl px-2 sm:px-8">
        <div className="border-t border-slate-200 pt-8 text-center">
          <p className="inline-flex h-auto items-center text-xs font-normal leading-[15px] text-[#6133DA] sm:text-xs">
            © 2026 Trendysize. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;