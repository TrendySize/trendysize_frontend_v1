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
  "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium leading-[17px] text-[var(--tk-ink)] transition-colors duration-[var(--tk-dur-base)] ease-[var(--tk-ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)] focus-visible:ring-inset";

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

      <aside className="tk-glass tk-glass-line fixed inset-y-0 left-0 z-40 hidden h-dvh w-[240px] flex-col overflow-y-auto border-r border-[var(--tk-glass-border)] px-4 py-8 lg:flex">
        <div className="flex h-12 shrink-0 items-center">
          <BrandLogo
            alt="TrendySize logo"
            className="h-11 w-11 shrink-0"
          />
          <span className="ml-3 min-w-0 font-['Inter'] text-lg font-extrabold leading-6 tracking-tight text-[#241065]">
            TRENDY<span className="text-[#6D4CE0]">SIZE</span>
          </span>
        </div>

        <nav
          className="mt-12 flex min-h-0 w-full flex-col gap-2 pb-4"
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

          <div className="mt-2 flex min-h-12 items-center justify-between px-3">
            <span className="text-xs font-medium text-[#5B5280]">
              Appearance
            </span>
            <ThemeToggle />
          </div>
        </nav>
      </aside>
    </>
  );
}
