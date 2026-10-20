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

import logoSrc from "../assets/images/nav.png";
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
  "flex h-[63px] w-[204px] items-center gap-4 rounded-l-[30px] px-4 text-left text-[14px] font-medium leading-[17px] text-[#241065] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA] focus-visible:ring-inset";

function itemClass(active) {
  return `${itemBase} ${
    active
      ? "bg-[#6133DA] text-[#EBE9FE]"
      : "bg-transparent hover:bg-white"
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

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[220px] shrink-0 border-r border-[#6133DA] bg-[#EBE9FE] shadow-[0_0_24px_8px_rgba(0,0,0,0.25)] lg:block">
        <div className="absolute left-[32px] top-[113px] flex h-[56px] w-[200px] items-center">
          <img
            src={logoSrc}
            alt="TrendySize logo"
            className="h-[48px] w-[48px] -translate-y-1 object-contain"
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
                    active ? "text-[#EBE9FE]" : "text-[#241065]"
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
