import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      setScrolled(y > 20);
      setScrollingUp(y < lastY.current);
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", to: "/#home" },
    { label: "Features", to: "/#features" },
    { label: "How it Works", to: "/#how-it-works" },
    { label: "Benefits", to: "/#benefits" },
    { label: "FAQ", to: "/#faq" },
    { label: "Pricing", to: "/#pricing" },
  ];

  const headerActive = scrolled || scrollingUp;

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-[var(--tk-dur-slow)] ease-[var(--tk-ease-out)] ${
        headerActive
          ? "tk-glass tk-glass-line border-b border-[var(--tk-glass-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8 max-[380px]:h-16 max-[380px]:px-3">

        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
        >
          <BrandLogo
            alt="Trendysize logo"
            className="h-9 w-9 max-[380px]:h-8 max-[380px]:w-8"
          />

          <span className="-ml-1 text-sm font-extrabold tracking-tight max-[380px]:-ml-1 max-[380px]:text-sm">
            <span className="text-[var(--tk-ink)]">TRENDY</span>
            <span className="text-[var(--tk-brand)]">SIZE</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden flex-1 items-center justify-center gap-10 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 ${
                headerActive ? "text-[var(--tk-ink)]" : "text-slate-600 dark:text-[var(--tk-ink-muted)]"
              } hover:text-[#6F4CFF] hover:underline hover:underline-offset-4`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 lg:flex">
          <ThemeToggle />

          <Link
            to="/signup"
            className="rounded-xl border border-[#6133DA] bg-[var(--tk-bg-elevated)] px-4 py-2 text-sm font-semibold text-[var(--tk-brand)] transition hover:bg-[#EBE9FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
          >
            Get started
          </Link>

          <Link
            to="/signin"
            className="rounded-xl bg-[#6F4CFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5E3EF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-1.5 lg:hidden max-[380px]:gap-1">
          <ThemeToggle variant="compact" />

          <Link
            to="/signin"
            className="rounded-lg bg-[#6F4CFF] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5E3EF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 max-[380px]:px-2 max-[380px]:py-1.5 max-[380px]:text-xs"
          >
            Sign in
          </Link>

          {/* Menu */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-3xl text-[var(--tk-ink)] transition hover:bg-[var(--tk-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 max-[380px]:text-2xl"
          >
            {isOpen ? <HiOutlineX aria-hidden="true" /> : <HiOutlineMenuAlt3 aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-nav"
        className={`tk-glass overflow-hidden transition-all duration-[var(--tk-dur-slow)] ease-[var(--tk-ease-out)] lg:hidden ${
          isOpen ? "max-h-96 border-t border-[var(--tk-glass-border)]" : "max-h-0"
        }`}
      >
        <nav
          aria-label="Main"
          className="space-y-5 px-5 py-5 max-[380px]:space-y-4 max-[380px]:px-4 max-[380px]:py-4"
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="block rounded-md text-sm font-medium text-[var(--tk-ink-soft)] transition duration-200 hover:text-[#6F4CFF] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 max-[380px]:text-sm"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            to="/signup"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg border border-[#6133DA] bg-[var(--tk-bg-elevated)] px-4 py-2.5 text-center text-xs font-semibold text-[var(--tk-brand)] transition hover:bg-[#EBE9FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 max-[380px]:px-3 max-[380px]:py-2 max-[380px]:text-xs"
          >
            Create free account
          </Link>

          <Link
            to="/signin"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg bg-[#6F4CFF] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#5E3EF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 max-[380px]:px-3 max-[380px]:py-2 max-[380px]:text-xs"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
