"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Bell,
  Menu,
  X,
  Mail,
  Gift,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface UserInfo {
  id: string;
  name: string;
  username: string;
  profilePhoto?: string | null;
  wishesLocked?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar({
  user,
  partner,
}: {
  user?: UserInfo | null;
  partner?: UserInfo | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkNotificationsRead = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      try {
        await fetch("/api/notifications", { method: "PATCH" });
        setUnreadCount(0);
      } catch {
        // ignore
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  // If user is not logged in or on login/onboarding page
  const hideFullNav = pathname === "/login" || pathname === "/onboarding";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-rose-200/40 dark:border-white/[0.06] bg-white/90 dark:bg-night-950/85 backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-3 sm:px-6">
          {/* Logo / Title */}
          <Link
            href={user?.wishesLocked ? "/dashboard" : "/onboarding"}
            className="flex items-center gap-2 group"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-wine-900 to-wine-600 shadow-glow-wine text-white">
              <Heart className="h-5 w-5 fill-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div>
              <span className="font-serif text-base sm:text-lg font-bold tracking-wide text-gray-900 dark:text-white">
                Vandan <span className="text-wine-600 dark:text-wine-400 font-sans">×</span> Muskaan
              </span>
              <span className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Our Little World
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (White / Black Mode) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Light and Dark Theme"
              title={theme === "dark" ? "Switch to White (Light) mode" : "Switch to Black (Dark) mode"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/60 dark:border-white/10 bg-rose-50/80 dark:bg-night-850/80 text-gray-700 dark:text-gray-300 transition hover:border-wine-500/50 hover:text-wine-600 dark:hover:text-white"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-wine-600" />
              )}
            </button>

            {!hideFullNav && user && partner && (
              <>
                {/* Static Partner Presence Badge (No account switching) */}
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-rose-200/60 dark:border-white/10 bg-rose-50/60 dark:bg-night-850/80 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-wine-600 dark:text-rose-300">Partner: {partner.name} ❤️</span>
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={handleMarkNotificationsRead}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/60 dark:border-white/10 bg-rose-50/60 dark:bg-night-850/80 text-gray-700 dark:text-gray-300 transition hover:border-wine-500/40 hover:text-wine-600 dark:hover:text-white"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wine-600 text-[10px] font-bold text-white shadow-glow-wine animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-rose-200/60 dark:border-white/10 bg-white/95 dark:bg-night-900/95 p-3 shadow-2xl backdrop-blur-2xl z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                        <span className="font-medium text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Updates &amp; Alerts
                        </span>
                        <span className="text-[11px] text-wine-600 dark:text-wine-400">
                          {notifications.length} recent
                        </span>
                      </div>
                      <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="py-6 text-center text-xs text-gray-400">
                            No notifications yet. Everything is serene ✨
                          </p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`rounded-xl p-2.5 text-xs transition ${
                                n.isRead
                                  ? "bg-gray-50 dark:bg-night-850/50 text-gray-700 dark:text-gray-300"
                                  : "bg-rose-50 dark:bg-wine-950/40 border border-rose-200 dark:border-wine-800/40 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="font-semibold text-wine-800 dark:text-rose-200">{n.title}</p>
                              <p className="mt-0.5 text-gray-600 dark:text-gray-400 leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu Drawer Toggle */}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/60 dark:border-white/10 bg-rose-50/60 dark:bg-night-850/80 text-gray-700 dark:text-gray-300 transition hover:border-wine-500/40 hover:text-wine-600 dark:hover:text-white"
                  aria-label="Menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="relative flex h-full w-full max-w-xs flex-col border-l border-rose-200/40 dark:border-white/10 bg-white dark:bg-night-900 p-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-wine-500/40 bg-wine-100 dark:bg-wine-950">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-wine-700 dark:text-wine-300">
                      {user?.name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-wine-600 dark:text-rose-300">With {partner?.name} ❤️</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="mt-6 flex-1 space-y-2">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                <span className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-wine-600" />
                  )}
                  <span>Theme</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-night-800 text-gray-600 dark:text-gray-400">
                  {theme === "dark" ? "Black Mode" : "White Mode"}
                </span>
              </button>

              <Link
                href="/letters"
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  pathname === "/letters"
                    ? "bg-rose-50 dark:bg-wine-900/50 text-wine-900 dark:text-white font-medium border border-rose-200 dark:border-wine-600/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Mail className="h-4 w-4 text-wine-500 dark:text-wine-400" />
                <span>Love Letters</span>
              </Link>

              <Link
                href="/surprises"
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  pathname === "/surprises"
                    ? "bg-rose-50 dark:bg-wine-900/50 text-wine-900 dark:text-white font-medium border border-rose-200 dark:border-wine-600/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Gift className="h-4 w-4 text-wine-500 dark:text-wine-400" />
                <span>Surprise Vault</span>
              </Link>

              <Link
                href="/level"
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  pathname === "/level"
                    ? "bg-rose-50 dark:bg-wine-900/50 text-wine-900 dark:text-white font-medium border border-rose-200 dark:border-wine-600/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Trophy className="h-4 w-4 text-wine-500 dark:text-wine-400" />
                <span>Relationship Level</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  pathname === "/settings"
                    ? "bg-rose-50 dark:bg-wine-900/50 text-wine-900 dark:text-white font-medium border border-rose-200 dark:border-wine-600/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Settings className="h-4 w-4 text-wine-500 dark:text-wine-400" />
                <span>Settings</span>
              </Link>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Lock Sanctuary &amp; Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
