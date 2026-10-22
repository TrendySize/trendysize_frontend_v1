import {
  CircleHelp,
  Headphones,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import BrandLogo from "./BrandLogo";
import MobileBottomNav from "./MobileBottomNav";
import ThemeToggle from "./ThemeToggle";
import { logout, clearToken } from "../services/api";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Profile", path: "/profile", icon: UserRound },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Help Center", path: "/help-center", icon: CircleHelp },
  { label: "Contact Support", path: "/contact-support", icon: Headphones },
];

const itemBase =
  "flex h-[63px] w-[204px] items-center gap-4 rounded-l-[30px] px-4 text-left text-[14px] font-medium leading-[17px] text-[var(--tk-ink)] transition-colors duration-[var(--tk-dur-base)] ease-[var(--tk-ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)] focus-visible:ring-inset";

function itemClass(active) {
  return `${itemBase} ${
    active
      ? "bg-[var(--tk-brand)] text-[var(--tk-brand-ink)]"
      : "bg-transparent hover:bg-[var(--tk-glass-highlight)]"
  }`;
}

export default function DashboardSidebar({ activeLabel = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Best-effort server call, then discard the token (guide §3.4).
    logout()
      .catch(() => {})
      .finally(() => {
        clearToken();
        navigate("/signin");
      });
  };

  return (
    <>
      <MobileBottomNav activeLabel={activeLabel} />

      <aside className="tk-glass tk-glass-line fixed left-0 top-0 z-40 hidden h-screen w-[220px] shrink-0 border-r border-[var(--tk-glass-border)] lg:block">
        <div className="absolute left-[32px] top-[113px] flex h-[56px] w-[200px] items-center">
          <BrandLogo
            alt="TrendySize logo"
            className="h-[48px] w-[48px] -translate-y-1"
          />
          <span className="ml-3 h-[32px] w-[152px] shrink-0 font-['Inter'] text-[20px] font-extrabold leading-[24px] tracking-tight text-[#241065]">
            TRENDY<span className="text-[#6D4CE0]">SIZE</span>
          </span>
        </div>

        <nav
          className="absolute left-[32px] top-[231px] flex w-[208px] flex-col gap-3"
          aria-label="Dashboard"
        >
          {navItems.map(({ label, path, icon: Icon }) => {
            const active =
              activeLabel === label || location.pathname === path;

            return (
              <Link
                key={label}
                to={path}
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                <Icon
                  size={24}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className={`shrink-0 ${
                    active ? "text-[var(--tk-brand-ink)]" : "text-[var(--tk-icon-strong)]"
                  }`}
                />
                <span>{label}</span>
              </Link>
            );
          })}

          <button type="button" onClick={handleLogout} className={itemBase}>
            <LogOut
              size={24}
              strokeWidth={1.5}
              aria-hidden="true"
              className="shrink-0 text-[#241065]"
            />
            <span>Logout</span>
          </button>

          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-[12px] font-medium text-[#5B5280]">
              Appearance
            </span>
            <ThemeToggle />
          </div>
        </nav>
      </aside>
    </>
  );
}
