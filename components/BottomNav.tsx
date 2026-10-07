"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ListChecks, Coins, CalendarDays, BookOpen } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on login or onboarding
  if (pathname === "/login" || pathname === "/onboarding") {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Heart },
    { label: "Wishes", href: "/wishes", icon: ListChecks },
    { label: "Fund", href: "/fund", icon: Coins },
    { label: "Dates", href: "/dates", icon: CalendarDays },
    { label: "Story", href: "/story", icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose-200/50 dark:border-white/[0.08] bg-white/95 dark:bg-night-950/90 backdrop-blur-2xl transition-colors duration-200 shadow-lg dark:shadow-none pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center rounded-2xl py-1.5 px-3 transition duration-200 ${
                isActive
                  ? "text-wine-600 dark:text-wine-400 font-semibold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 h-1 w-6 rounded-full bg-wine-600 dark:bg-wine-500 shadow-glow-wine" />
              )}
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? "scale-110 fill-wine-500/20" : ""
                }`}
              />
              <span className="mt-1 text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
