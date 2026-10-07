"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Heart,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface MemoryItem {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string | null;
  location?: string | null;
  emoji?: string | null;
  createdById: string;
  createdBy: { name: string; username: string };
  createdAt: string;
}

export default function StoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [emoji, setEmoji] = useState("❤️");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMemories = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);

      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          location: location.trim() || undefined,
          emoji: emoji || "❤️",
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle("");
        setDate("");
        setDescription("");
        setImageUrl("");
        setLocation("");
        fetchMemories();
      } else {
        alert("Failed to save memory");
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

  return (
    <div className="min-h-screen pb-28">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-2xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-wine-600 dark:text-rose-300 font-bold">
              CHRONICLE OF US
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              Our Story ❤️
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-glow-wine transition hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Memory</span>
          </button>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:bottom-0 before:left-2.5 sm:before:left-3 before:top-2 before:w-0.5 before:bg-gradient-to-b before:from-wine-500 before:via-rose-600 before:to-transparent">
          {memories.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-night-900/60 p-8 sm:p-10 text-center text-xs text-gray-500 dark:text-gray-400">
              <BookOpen className="mx-auto h-8 w-8 text-wine-600 dark:text-wine-400 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">Your story timeline is waiting to be written.</p>
              <p className="mt-1">Tap &quot;+ Add Memory&quot; to preserve your milestones together!</p>
            </div>
          ) : (
            memories.map((mem) => (
              <div key={mem.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-wine-500 bg-white dark:bg-night-950 text-xs shadow-glow-wine">
                  {mem.emoji || "❤️"}
                </div>

                {/* Memory Card */}
                <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl transition hover:border-wine-300 dark:hover:border-wine-500/40">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-white/5">
                    <span className="font-mono text-xs font-bold text-wine-600 dark:text-rose-300">
                      {new Date(mem.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      {mem.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-wine-600 dark:text-wine-400" />
                          <span>{mem.location}</span>
                        </span>
                      )}
                      <span>·</span>
                      <span>By {mem.createdBy?.name}</span>
                    </div>
                  </div>

                  <h3 className="mt-3 font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {mem.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {mem.description}
                  </p>

                  {/* Optional Image */}
                  {mem.imageUrl && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
                      <img
                        src={mem.imageUrl}
                        alt={mem.title}
                        className="h-56 sm:h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL: ADD MEMORY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-wine-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-4">
              📖 Preserve a Memory
            </h3>

            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. When We Walked by the Lake"
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
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    maxLength={2}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-center text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Our Favorite Cafe"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  The Story
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the moment, the laughter, and the feeling..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
                  required
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
                  {isSubmitting ? "Preserving..." : "Add to Story ❤️"}
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
