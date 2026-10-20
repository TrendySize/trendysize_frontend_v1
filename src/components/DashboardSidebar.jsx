import {
  Bell,
  CircleHelp,
  Headphones,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import logoSrc from "../assets/images/nav.png";
import DashboardMobileMenu from "./DashboardMobileMenu";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Profile & Settings", icon: Settings },
  { label: "Help Center", icon: CircleHelp },
  { label: "Contact Support", icon: Headphones },
  { label: "Notifications", icon: Bell },
];

export default function DashboardSidebar({
  activeLabel = "Dashboard",
  mobileOpen = false,
  onClose,
}) {
  return (
    <>
      {mobileOpen && <DashboardMobileMenu onClose={onClose} />}

      <aside
        className="dashboard-sidebar fixed left-0 top-0 z-40 hidden h-screen w-[220px] shrink-0 border-r border-[#6133DA] bg-[#EBE9FE] shadow-[0_0_24px_8px_rgba(0,0,0,0.25)] lg:block"
      >
        <div className="absolute left-[32px] top-[113px] flex h-[56px] w-[200px] items-center">
        <img
          src={logoSrc}
          alt="TrendySize logo"
          className="h-[48px] w-[48px] -translate-y-1 object-contain"
        />
        <span className="ml-3 h-[32px] w-[152px] shrink-0 font-['Inter'] text-[20px] font-extrabold leading-[24px] tracking-tight text-[#241065]">
          TRENDY<span className="text-[#9B8CF9]">SIZE</span>
        </span>
      </div>

      <nav className="dashboard-nav absolute left-[32px] top-[231px] flex w-[208px] flex-col gap-3">
        {navItems.map(({ label, icon: Icon }) => (
          <a
            key={label}
            href={
              label === "Dashboard"
                ? "/dashboard"
                : label === "Customers"
                  ? "/customers"
                  : label === "Profile & Settings"
                    ? "/profile-settings"
                    : label === "Help Center"
                      ? "/help-center"
                      : label === "Contact Support"
                        ? "/contact-support"
                  : `#${label.toLowerCase().replaceAll(" ", "-")}`
            }
            className={`dashboard-nav-item ${
              activeLabel === label ? "dashboard-nav-active" : ""
            }`}
          >
            <Icon size={24} strokeWidth={1.5} className="dashboard-nav-icon" />
            <span>{label}</span>
          </a>
        ))}

        <button
          type="button"
          onClick={() => {
            // Best-effort server call, then discard the token (guide §3.4).
            import("../services/api").then(({ logout, clearToken }) => {
              logout().catch(() => {}).finally(() => {
                clearToken();
                window.location.href = "/signin";
              });
            });
          }}
          className="dashboard-nav-item"
        >
          <LogOut size={24} strokeWidth={1.5} className="dashboard-nav-icon" />
          <span>Logout</span>
        </button>
      </nav>

      <style>
        {`
          .dashboard-nav-item {
            display: flex !important;
            align-items: center !important;
            width: 204px !important;
            height: 63px !important;
            gap: 16px !important;
            padding: 16px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            border: 0 !important;
            border-radius: 30px 0 0 30px !important;
            background-color: transparent !important;
            color: #241065 !important;
            font-family: 'SF Pro', sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            line-height: 17px !important;
            text-align: left !important;
            text-decoration: none !important;
            cursor: pointer !important;
            outline: none !important;
            transition: none !important;
          }

          .dashboard-nav-item .dashboard-nav-icon {
            width: 24px !important;
            height: 24px !important;
            flex-shrink: 0 !important;
            color: #241065 !important;
          }

          .dashboard-nav-item span {
            color: #241065 !important;
          }

          .dashboard-nav-item.dashboard-nav-active {
            background-color: #6133DA !important;
            color: #EBE9FE !important;
            width: 204px !important;
          }

          .dashboard-nav-item.dashboard-nav-active .dashboard-nav-icon,
          .dashboard-nav-item.dashboard-nav-active span {
            color: #EBE9FE !important;
          }

          .dashboard-nav-item:not(.dashboard-nav-active):hover {
            background-color: #FFFFFF !important;
            color: #241065 !important;
            width: 204px !important;
          }

          .dashboard-nav-item:not(.dashboard-nav-active):hover .dashboard-nav-icon,
          .dashboard-nav-item:not(.dashboard-nav-active):hover span {
            color: #241065 !important;
          }

          .dashboard-nav-item:focus {
            outline: none !important;
          }

          .dashboard-nav button.dashboard-nav-item {
            appearance: none !important;
            -webkit-appearance: none !important;
          }

        `}
      </style>
    </aside>
    </>
  );
}