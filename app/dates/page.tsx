"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Sparkles,
  Heart,
  Plus,
  Clock,
  Cake,
  Flame,
  Gift,
  PartyPopper,
  Bookmark,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface DateItem {
  id: string;
  title: string;
  category: string;
  emoji: string;
  daysLeft: number;
  formattedDate: string;
  description?: string;
}

export default function DatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [upcoming, setUpcoming] = useState<DateItem[]>([]);
  const [nearest, setNearest] = useState<DateItem | null>(null);
  const [startDate, setStartDate] = useState("2025-12-18");
  const [categories, setCategories] = useState<Record<string, any[]>>({});

  // Tab
  const [activeTab, setActiveTab] = useState<
    "UPCOMING" | "ANNIVERSARIES" | "BIRTHDAYS" | "MILESTONES" | "LOVE_DAYS" | "FESTIVALS"
  >("UPCOMING");

  // Add date modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCategory, setNewCategory] = useState("CUSTOM");
  const [newEmoji, setNewEmoji] = useState("❤️");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDates = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);

      const res = await fetch("/api/dates");
      if (res.ok) {
        const data = await res.json();
        setUpcoming(data.upcoming || []);
        setNearest(data.nearest || null);
        setStartDate(data.startDate);
        setCategories(data.categories || {});
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          date: newDate,
          category: newCategory,
          emoji: newEmoji,
          description: newDesc.trim() || undefined,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle("");
        setNewDate("");
        setNewDesc("");
        fetchDates();
      } else {
        alert("Failed to add date");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-night-950">
        <Heart className="h-8 w-8 text-wine-500 animate-ping" />
      </div>
    );
  }

  // Filter based on active tab
  let displayList: any[] = [];
  if (activeTab === "UPCOMING") {
    displayList = upcoming;
  } else if (activeTab === "ANNIVERSARIES") {
    displayList = upcoming.filter((d) => d.category === "ANNIVERSARY");
  } else if (activeTab === "BIRTHDAYS") {
    displayList = categories.BIRTHDAY || [];
  } else if (activeTab === "MILESTONES") {
    displayList = categories.RELATIONSHIP || [];
  } else if (activeTab === "LOVE_DAYS") {
    displayList = categories.LOVE_DAY || [];
  } else if (activeTab === "FESTIVALS") {
    displayList = categories.FESTIVAL || [];
  }

  return (
    <div className="min-h-screen pb-28">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-2xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HEADER & ADD BUTTON */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-wine-600 dark:text-rose-300 font-bold">
              CALENDAR OF DEVOTION
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              Our Dates ❤️
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-glow-wine transition hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Special Day</span>
          </button>
        </div>

        {/* NEAREST EVENT COUNTDOWN HERO */}
        {nearest && (
          <div className="relative overflow-hidden rounded-3xl border border-rose-300 dark:border-rose-500/30 bg-white/95 dark:bg-gradient-to-r dark:from-night-900/95 dark:via-wine-950/60 dark:to-night-900/95 p-5 sm:p-8 shadow-2xl backdrop-blur-2xl transition-colors duration-200">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-rose-400/10 dark:bg-rose-500/15 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 text-[11px] font-semibold text-wine-700 dark:text-rose-200">
                <Sparkles className="h-3 w-3 text-rose-500" />
                <span>Next Milestone Approaching</span>
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-400">{nearest.formattedDate}</span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-night-850/80 border border-rose-200 dark:border-white/10 text-3xl shadow-sm dark:shadow-glow-wine">
                {nearest.emoji}
              </div>

              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {nearest.title}
                </h2>
                <p className="text-xs text-wine-700 dark:text-rose-300 mt-0.5">
                  {nearest.daysLeft === 0
                    ? "Today is the day! Celebrate together ❤️"
                    : `${nearest.daysLeft} days until we celebrate`}
                </p>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/70 p-4 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-wine-600 dark:text-wine-400">
                  {nearest.daysLeft}
                </span>
                <span className="font-mono text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {nearest.daysLeft === 1 ? "DAY LEFT" : "DAYS LEFT"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab("UPCOMING")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 transition ${
              activeTab === "UPCOMING"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-night-900/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            ⏳ Upcoming ({upcoming.length})
          </button>

          <button
            onClick={() => setActiveTab("ANNIVERSARIES")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 transition ${
              activeTab === "ANNIVERSARIES"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-night-900/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🥂 Anniversaries
          </button>

          <button
            onClick={() => setActiveTab("BIRTHDAYS")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 transition ${
              activeTab === "BIRTHDAYS"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-night-900/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🎂 Birthdays
          </button>

          <button
            onClick={() => setActiveTab("MILESTONES")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 transition ${
              activeTab === "MILESTONES"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-night-900/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🌹 Milestones
          </button>

          <button
            onClick={() => setActiveTab("LOVE_DAYS")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 transition ${
              activeTab === "LOVE_DAYS"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-night-900/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            💌 Love Days
          </button>

          <button
            onClick={() => setActiveTab("FESTIVALS")}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 transition ${
              activeTab === "FESTIVALS"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-night-900/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🪔 Festivals
          </button>
        </div>

        {/* DATES CARDS LIST */}
        <div className="space-y-3">
          {displayList.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white/60 dark:bg-night-900/40 p-8 text-center text-xs text-gray-500">
              No dates in this category yet.
            </div>
          ) : (
            displayList.map((item, idx) => {
              const hasDaysLeft = typeof item.daysLeft === "number";

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-4 transition hover:border-wine-300 dark:hover:border-white/20 shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-night-850 border border-gray-100 dark:border-white/5 text-2xl shadow-sm">
                      {item.emoji || "❤️"}
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-wine-600 dark:text-rose-300">
                        {item.formattedDate || item.date}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {hasDaysLeft && (
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-serif text-xl sm:text-2xl font-bold text-wine-600 dark:text-wine-400">
                        {item.daysLeft}
                      </span>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {item.daysLeft === 0 ? "Today! 🎉" : "Days"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL: ADD SPECIAL DATE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-wine-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-4">
              ✨ Add Our Special Day
            </h3>

            <form onSubmit={handleAddDate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Our First Concert Together"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    maxLength={2}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-center text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="CUSTOM">Custom Personal Date</option>
                  <option value="RELATIONSHIP">Relationship Milestone</option>
                  <option value="LOVE_DAY">Love Day</option>
                  <option value="FESTIVAL">Festival</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Description / Memory Note (Optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Why this day is precious to us..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-glow-wine hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Special Day ❤️"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
