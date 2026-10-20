import {
  Bell,
  CircleHelp,
  Grid2X2,
  Headphones,
  LogOut,
  Settings,
  UsersRound,
  X,
} from "lucide-react";

import drawerLogo from "../assets/images/nav.png";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Grid2X2 },
  { label: "Customers", path: "/customers", icon: UsersRound },
  { label: "Profile & Settings", path: "/profile-settings", icon: Settings },
  { label: "Help Center", path: "/help-center", icon: CircleHelp },
  { label: "Contact Support", path: "/contact-support", icon: Headphones },
  { label: "Notifications", path: "#notifications", icon: Bell },
];

const menuItemBaseClassName = `
  group
  flex
  h-[36px]
  w-full
  items-center
  gap-[12px]
  rounded-[10px]
  border
  border-transparent
  px-[10px]
  py-[4px]
  text-left
  transition-[background-color,border-color,box-shadow]
  duration-150
`;

const menuItemClassName = `
  ${menuItemBaseClassName}
  hover:border-[#DED5FF]
  hover:bg-white
  hover:shadow-[0_3px_12px_rgba(97,51,218,0.10)]
  focus-visible:border-[#DED5FF]
  focus-visible:bg-white
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-[#9B8AFB]/40
`;

function navigateTo(path, onClose) {
  onClose();
  window.location.href = path;
}

function logout(onClose) {
  onClose();

  // Best-effort server call, then discard all local auth (guide §3.4).
  import("../services/api").then(({ logout: apiLogout, clearToken }) => {
    apiLogout()
      .catch(() => {})
      .finally(() => {
        clearToken();
        localStorage.removeItem("trendySize_user");
        localStorage.removeItem("user");
        window.location.href = "/signin";
      });
  });
}

export default function DashboardMobileMenu({ onClose }) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-[998] hidden bg-[#241065]/30 max-lg:block"
      />

      <aside
        className="
          mobile-drawer-drop
          fixed
          left-0
          top-0
          z-[999]
          hidden
          h-auto
          max-h-[80vh]
          w-screen
          flex-col
          overflow-y-auto
          rounded-b-[16px]
          bg-[#F4F3FF]
          shadow-[0_8px_25px_rgba(36,16,101,0.08)]
          max-lg:flex
        "
      >
        <div
          aria-hidden="true"
          className="h-[34px] w-full shrink-0 bg-[#F4F3FF]"
        />

        <div className="flex h-[48px] w-full shrink-0 items-center justify-between bg-[#F4F3FF] px-[16px] py-[8px]">
          <button
            type="button"
            aria-label="Go to dashboard"
            onClick={() => navigateTo("/dashboard", onClose)}
            className="flex items-center gap-0"
          >
            <img
              src={drawerLogo}
              alt=""
              className="h-9 w-9 object-contain max-[380px]:h-8 max-[380px]:w-8"
            />
            <span className="-ml-1 text-[14px] font-extrabold text-[#241065] max-[380px]:text-[13px]">
              TRENDY<span className="text-[#9B8AFB]">SIZE</span>
            </span>
          </button>

          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-[24px] w-[24px] items-center justify-center"
          >
            <X size={24} strokeWidth={1.5} className="text-[#6133DA]" />
          </button>
        </div>

        <nav className="flex w-full flex-col gap-[8px] bg-[#F4F3FF] px-[32px] py-[16px]">
          <div className="flex flex-col gap-[8px]">
            {navItems.map(({ label, path, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigateTo(path, onClose)}
                className={menuItemClassName}
              >
                <Icon
                  size={16}
                  strokeWidth={1.6}
                  className="text-[#241065] transition-colors group-hover:text-[#6133DA] group-focus-visible:text-[#6133DA]"
                />
                <span className="font-['Inter'] text-[14px] font-medium text-[#241065] transition-colors group-hover:text-[#6133DA] group-focus-visible:text-[#6133DA]">
                  {label}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => logout(onClose)}
            className={`${menuItemBaseClassName} hover:border-[#FECACA] hover:bg-[#FFF7F7] hover:shadow-[0_3px_12px_rgba(239,68,68,0.08)] focus-visible:border-[#FECACA] focus-visible:bg-[#FFF7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCA5A5]/40`}
          >
            <LogOut size={16} strokeWidth={1.6} className="text-[#EF4444]" />
            <span className="font-['Inter'] text-[14px] font-medium text-[#241065] transition-colors group-hover:text-[#B91C1C] group-focus-visible:text-[#B91C1C]">
              Logout
            </span>
          </button>
        </nav>
      </aside>
    </>
  );
}