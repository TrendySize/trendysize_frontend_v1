
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineMenuAlt3,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineX,
} from "react-icons/hi";
import logoSrc from "../assets/images/nav.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

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

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const body = document.body;
    const isCurrentlyDark = root.classList.contains("dark");

    if (isCurrentlyDark) {
      root.classList.remove("dark");
      body.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      body.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

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
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        headerActive
          ? "bg-white/30 backdrop-blur-xl dark:bg-slate-950/30"
          : "bg-transparent dark:bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8 max-[380px]:h-16 max-[380px]:px-3">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-0">
          <img
            src={logoSrc}
            alt="Trendysize logo"
            className="h-9 w-9 rounded-lg p-0 max-[380px]:h-8 max-[380px]:w-8"
          />

          <span className="-ml-1 text-[14px] font-extrabold tracking-tight max-[380px]:-ml-1 max-[380px]:text-[13px]">
  <span className="text-[#241065]">TRENDY</span>
  <span className="text-[#9B8AFB]">SIZE</span>
</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden flex-1 items-center justify-center gap-10 lg:flex">
          {navLinks.map((item) => {
            const showBg = scrolled || scrollingUp;

            return (
              <Link
                key={item.label}
                to={item.to}
                className={`text-[15px] font-medium transition duration-200 ${
                  showBg
                    ? "text-[#241065] dark:text-white"
                    : "text-slate-600 dark:text-slate-200"
                } hover:text-[#6F4CFF] hover:underline hover:underline-offset-4`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 lg:flex">
          <button
            onClick={toggleDarkMode}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center rounded-xl border border-slate-300
             bg-white p-2 text-slate-700 transition hover:bg-slate-100
              dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <HiOutlineSun className="h-5 w-5" />
            ) : (
              <HiOutlineMoon className="h-5 w-5" />
            )}
          </button>

          <Link
            to="/signin"
            className="rounded-xl bg-[#6F4CFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5E3EF5]"
          >
            Sign in
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-1.5 lg:hidden max-[380px]:gap-1">

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 max-[380px]:p-1.5"
          >
            {isDark ? (
              <HiOutlineSun className="h-4.5 w-4.5 max-[380px]:h-4 max-[380px]:w-4" />
            ) : (
              <HiOutlineMoon className="h-4.5 w-4.5 max-[380px]:h-4 max-[380px]:w-4" />
            )}
          </button>

          {/* Sign In */}
          <Link
            to="/signin"
            className="rounded-lg bg-[#6F4CFF] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#5E3EF5] max-[380px]:px-2 max-[380px]:py-1.5 max-[380px]:text-[10px]"
          >
            Sign in
          </Link>

          {/* Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[27px] text-[#1B1642] dark:text-slate-100 max-[380px]:text-2xl"
          >
            {isOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden bg-white transition-all duration-300 lg:hidden ${
          isOpen
            ? "max-h-96 border-t border-slate-100 dark:bg-slate-950 dark:border-slate-800"
            : "max-h-0"
        }`}
      >
        <div className="space-y-5 px-5 py-5 max-[380px]:space-y-4 max-[380px]:px-4 max-[380px]:py-4">

          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="block text-[14px] font-medium text-slate-700 transition duration-200 hover:text-[#6F4CFF] hover:underline hover:underline-offset-4 dark:text-slate-200 max-[380px]:text-[13px]"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            to="/signin"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg bg-[#6F4CFF] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#5E3EF5] max-[380px]:px-3 max-[380px]:py-2 max-[380px]:text-[11px]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

