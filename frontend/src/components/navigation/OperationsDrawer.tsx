
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  ChevronLeft,
  Command,
  Database,
  LayoutDashboard,
  Menu,
  RadioTower,
  Search,
  Settings,
  ShieldAlert,
  Users,
  X,
  Moon,
  Sun,
  Languages,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/Button";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import { useTranslation } from "@/hooks/useTranslation";

const nav = [
  {
    href: "/",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/tracks",
    label: "Live Tracks",
    icon: RadioTower,
  },
  {
    href: "/sources",
    label: "Data Sources",
    icon: Database,
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: ShieldAlert,
  },
  {
    href: "/health",
    label: "System Health",
    icon: Activity,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    permission: "users.manage" as const,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function OperationsDrawer({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const can = useAuthStore((state) => state.can);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { language, theme, toggleLanguage, toggleTheme } = useAppPreferences();
  const { t } = useTranslation();

  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);

  // Command palette shortcut
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setPalette(true);
      }

      if (event.key === "Escape") {
        setPalette(false);
        setMobile(false);
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  const signOut = async () => {
    await logout();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "OP";

  const visibleNav = nav.filter(
    (item) => !item.permission || can(item.permission)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 selection:bg-cyan-300 selection:text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile overlay */}
      {mobile && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "operations-sidebar fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r border-slate-200 bg-white/95 dark:border-white/[.07] dark:bg-slate-950/95 backdrop-blur-xl",
          "transition-all duration-300",
          "w-[260px]",
          collapsed ? "lg:w-[78px]" : "",
          mobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 dark:border-white/[.06]">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
            <RadioTower size={18} />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-[.18em]">
                  <span className="text-cyan-300">Air</span>operations
              </div>

               
            </div>
          )}

          {/* Desktop collapse */}
          <button
            type="button"
            className="ml-auto hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/5 dark:hover:text-white lg:block"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <ChevronLeft
              size={16}
              className={collapsed ? "rotate-180" : ""}
            />
          </button>

          {/* Mobile close */}
          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        {/* Workspace */}
        {!collapsed && (
          <div className="mx-3 mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/[.06] dark:bg-white/[.025]">
            <div className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">
              {t.common.workspace}
            </div>

            <div className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
              {user?.organization?.name ?? "Operations"}
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-300">
              <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              {t.common.secureSession}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3">
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                onClick={() => setMobile(false)}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-sm transition-all duration-200",
                  active
                    ? "bg-cyan-300/10 text-cyan-700 shadow-inner shadow-cyan-300/5 dark:text-cyan-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[.04] dark:hover:text-white",
                ].join(" ")}
              >
                <Icon
                  size={17}
                  className={
                    active
                      ? "text-cyan-300"
                      : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }
                />

                {!collapsed && (
                  <>
                    <span className="flex-1">{t.common[label === "Overview" ? "overview" : label === "Live Tracks" ? "liveTracks" : label === "Data Sources" ? "dataSources" : label === "Alerts" ? "alerts" : label === "System Health" ? "systemHealth" : label === "Users" ? "users" : "settings"]}</span>

                    {href === "/alerts" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,.8)]" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-3 dark:border-white/[.06]">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-3 rounded-xl p-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 text-xs font-bold text-slate-950">
                {initials}
              </span>

              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                  {user?.name ?? "Operator"}
                </div>

                <div className="truncate text-[10px] uppercase tracking-wider text-slate-600">
                  {user?.role ?? "operator"}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={signOut}
            className={[
              "w-full rounded-xl px-3 py-2 text-left text-xs",
              "text-slate-500 transition",
              "hover:bg-rose-400/5 hover:text-rose-300",
            ].join(" ")}
          >
            {collapsed ? "↗" : t.common.signOut}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        data-collapsed={collapsed}
        className={[
          "operations-main min-h-screen transition-[padding] duration-300",
          collapsed ? "lg:pl-[78px]" : "lg:pl-[260px]",
        ].join(" ")}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-white/[.06] dark:bg-slate-950/80 sm:px-6">
          {/* Mobile menu */}
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </Button>

          {/* Search */}
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex h-10 min-w-0 max-w-xl flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-white/[.07] dark:bg-white/[.025] dark:text-slate-600 dark:hover:border-white/15 dark:hover:text-slate-400"
          >
            <Search size={15} />

            <span className="truncate">
              {t.common.search}
            </span>

            <kbd className="ml-auto hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[9px] text-slate-500 dark:border-white/10 dark:text-slate-600 sm:block">
              ⌘ K
            </kbd>
          </button>

          {/* Header actions */}
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleLanguage}
              aria-label="Change language"
              title={language === "en" ? t.common.arabic : t.common.english}
            >
              <Languages size={17} />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "dark" ? t.common.lightMode : t.common.darkMode}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              aria-label={t.common.notifications}
            >
              <Bell size={17} />
            </Button>

            <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300 sm:flex">
              <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {t.common.live}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>

      {/* Command Palette */}
      {palette && (
        <div
          className="fixed inset-0 z-[60] grid place-items-start bg-slate-950/75 p-4 pt-[12vh] backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPalette(false);
            }
          }}
        >
          <section className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 dark:border-white/10">
              <Command
                size={17}
                className="shrink-0 text-cyan-300"
              />

              <input
                autoFocus
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600"
                placeholder={t.common.search}
              />

              <button
                type="button"
                onClick={() => setPalette(false)}
                className="rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-white/5"
                aria-label="Close command palette"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Commands */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {visibleNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setPalette(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <Icon size={16} className="text-slate-500" />

                  <span>{label}</span>

                  <span className="ml-auto text-[10px] text-slate-600">
                    ↵
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
