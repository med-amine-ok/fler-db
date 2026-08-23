import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Database,
  User,
  ShieldCheck,
  ClipboardList,
  ChevronLeft,
  Truck,
} from "lucide-react";
import { clsx } from "clsx";
import { supabase } from "../lib/supabase";
import { useEffect, useRef, useState } from "react";
import { SUPER_ADMIN_EMAIL, SECRETARY_EMAILS } from "../lib/constants";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/* ── Tooltip wrapper — uses fixed positioning to escape scrollable nav ── */
const NavTooltip = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const [y, setY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const show = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setY(rect.top + rect.height / 2);
    }
    setVisible(true);
  };

  return (
    <div
      ref={ref}
      className="relative flex justify-center w-full"
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: "fixed",
            left: "4.5rem",
            top: y,
            transform: "translateY(-50%)",
          }}
          className="z-[9999] px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg whitespace-nowrap shadow-xl pointer-events-none animate-fade-in"
        >
          {label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </div>
  );
};

/* ── Single nav link that adapts to collapsed / full mode ── */
const SideNavLink = ({
  icon: Icon,
  label,
  path,
  collapsed,
  onClose,
  shortcut,
}: {
  icon: React.ElementType;
  label: string;
  path: string;
  collapsed: boolean;
  onClose: () => void;
  shortcut?: string;
}) => (
  <NavLink to={path} onClick={onClose} className="block w-full">
    {({ isActive }) =>
      collapsed ? (
        <div
          className={clsx(
            "w-10 h-10 flex items-center justify-center rounded-2xl mx-auto transition-all duration-200",
            isActive
              ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
              : "bg-white/5 text-gray-400 hover:bg-primary/20 hover:text-white hover:scale-105",
          )}
        >
          <Icon size={20} />
        </div>
      ) : (
        <div
          className={clsx(
            "flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-200 group/link",
            isActive
              ? "bg-primary text-white shadow-lg shadow-primary/25 font-semibold"
              : "text-gray-400 hover:bg-white/5 hover:text-white",
          )}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Icon
              size={22}
              className={clsx(
                "transition-transform duration-200",
                isActive ? "scale-110" : "group-hover/link:scale-110",
              )}
            />
            <span className="text-sm whitespace-nowrap truncate">{label}</span>
          </div>
          {shortcut && (
            <kbd
              className={clsx(
                "hidden group-hover/link:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all shrink-0",
                isActive
                  ? "bg-white/20 border-white/20 text-white"
                  : "bg-white/5 border-white/5 text-gray-500",
              )}
            >
              {shortcut}
            </kbd>
          )}
        </div>
      )
    }
  </NavLink>
);

export const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}: SidebarProps) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSecretary, setIsSecretary] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const email = user?.email?.toLowerCase() || "";
      if (email === SUPER_ADMIN_EMAIL) setIsSuperAdmin(true);
      if (SECRETARY_EMAILS.includes(email)) setIsSecretary(true);
    });
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/home", shortcut: "⌥1" },
    { icon: Database, label: "Database", path: "/database", shortcut: "⌥2" },
    { icon: Calendar, label: "Events", path: "/events", shortcut: "⌥3" },
    {
      icon: Truck,
      label: "Logistics Teams",
      path: "/teams/logistics",
      shortcut: "⌥4",
    },
    { icon: User, label: "My Profile", path: "/profile", shortcut: "⌥5" },
  ];

  const secretaryItems = [
    {
      icon: ClipboardList,
      label: "Secretary",
      path: "/secretary",
      shortcut: "⌥S",
    },
  ];
  const adminItems = [
    {
      icon: ShieldCheck,
      label: "Super Admin",
      path: "/super-admin",
      shortcut: "⌥A",
    },
  ];

  const closeMobile = () => setSidebarOpen(false);

  // Show both icon and label on mobile (w-full), only collapse on desktop
  const renderItems = (items: typeof navItems) =>
    items.map((item) => {
      // If on mobile (sidebarOpen is true and window.innerWidth < 768), always show label
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (isMobile) {
        return (
          <SideNavLink
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            collapsed={false}
            onClose={closeMobile}
            shortcut={item.shortcut}
          />
        );
      }
      // Desktop: collapse logic
      return sidebarCollapsed ? (
        <NavTooltip key={item.path} label={item.label}>
          <SideNavLink
            icon={item.icon}
            label={item.label}
            path={item.path}
            collapsed={true}
            onClose={closeMobile}
            shortcut={item.shortcut}
          />
        </NavTooltip>
      ) : (
        <SideNavLink
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          collapsed={false}
          onClose={closeMobile}
          shortcut={item.shortcut}
        />
      );
    });

  return (
    <>
      {/* ── Mobile overlay ── */}
      <div
        onClick={closeMobile}
        className={clsx(
          "fixed inset-0 z-40 md:hidden transition-all duration-500",
          sidebarOpen
            ? "bg-black/40 backdrop-blur-sm pointer-events-auto"
            : "bg-transparent backdrop-blur-none pointer-events-none",
        )}
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={clsx(
          "h-screen bg-sidebar text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          /* desktop width */
          sidebarCollapsed ? "md:w-16" : "md:w-72",
          /* mobile: always w-72, slides in/out */
          "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div
          className={clsx(
            "flex items-center border-b border-white/5 shrink-0 transition-all duration-300",
            sidebarCollapsed
              ? "justify-center px-2 py-5"
              : "justify-between px-6 py-5 md:px-8",
          )}
        >
          {!sidebarCollapsed && (
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
              FLER DataBase
            </h1>
          )}

          {/* Desktop collapse chevron */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={clsx(
              "hidden md:flex items-center justify-center rounded-xl transition-all duration-200",
              "hover:bg-white/10 text-gray-400 hover:text-white shrink-0",
              sidebarCollapsed ? "w-10 h-10" : "w-8 h-8",
            )}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={18}
              className={clsx(
                "transition-transform duration-300",
                sidebarCollapsed && "rotate-180",
              )}
            />
          </button>

          {/* Mobile X close */}
          <button
            onClick={closeMobile}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors relative shrink-0"
            aria-label="Close sidebar"
          >
            <span className="absolute block w-5 h-0.5 bg-white rounded-full rotate-45" />
            <span className="absolute block w-5 h-0.5 bg-white rounded-full -rotate-45" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={clsx(
            "flex-1 py-4 overflow-y-auto",
            sidebarCollapsed
              ? "flex flex-col items-center gap-1 px-3"
              : "px-4 space-y-1",
          )}
        >
          {/* Main label */}
          {!sidebarCollapsed ? (
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Menu
            </p>
          ) : (
            <div className="w-6 h-px bg-white/10 mb-2" />
          )}

          {renderItems(navItems)}

          {isSecretary && (
            <>
              {sidebarCollapsed ? (
                <div className="w-6 h-px bg-white/10 my-2" />
              ) : (
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
                  Secretary
                </p>
              )}
              {renderItems(secretaryItems)}
            </>
          )}

          {isSuperAdmin && (
            <>
              {sidebarCollapsed ? (
                <div className="w-6 h-px bg-white/10 my-2" />
              ) : (
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
                  Admin
                </p>
              )}
              {renderItems(adminItems)}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};
