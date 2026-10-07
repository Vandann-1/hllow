"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Heart,
  User,
  Calendar,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [coupleSettings, setCoupleSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [profilePhoto, setProfilePhoto] = useState("");
  const [birthday, setBirthday] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [relationshipStartDate, setRelationshipStartDate] = useState("2025-12-18");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset Onboarding Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetBoth, setResetBoth] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setPartner(data.partner);
      setCoupleSettings(data.coupleSettings);

      setProfilePhoto(data.user?.profilePhoto || "");
      setBirthday(data.user?.birthday || "");
      setRelationshipStartDate(data.coupleSettings?.relationshipStartDate || "2025-12-18");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profilePhoto: profilePhoto.trim() || undefined,
          birthday: birthday || undefined,
          newPassword: newPassword.trim() || undefined,
          relationshipStartDate,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setNewPassword("");
        fetchSettings();
      } else {
        alert("Failed to update settings");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (confirmText !== "RESET_OUR_WISHES") {
      alert("Please type 'RESET_OUR_WISHES' exactly to confirm.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/settings/reset-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmText,
          resetBoth,
        }),
      });

      if (res.ok) {
        setShowResetModal(false);
        router.push("/onboarding");
      } else {
        const err = await res.json();
        alert(err.error || "Reset failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsResetting(false);
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

      <main className="mx-auto max-w-xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HEADER */}
        <div>
          <span className="text-[11px] uppercase tracking-widest text-wine-600 dark:text-rose-300 font-bold">
            CUSTOMIZATION &amp; CONTROL
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            Settings ⚙️
          </h1>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        {/* SETTINGS FORM */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Couple Settings */}
          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-white/10">
              <Heart className="h-4 w-4 text-wine-600 dark:text-wine-400" />
              <h2 className="font-serif text-base font-bold text-gray-900 dark:text-white">
                Couple Sanctuary Settings
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Official Relationship Start Date
              </label>
              <input
                type="date"
                value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-wine-500"
                required
              />
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-1">
                Proposal Day (18 December) calculates your together timer, anniversaries, and milestones.
              </span>
            </div>
          </div>

          {/* User Profile Settings */}
          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-white/10">
              <User className="h-4 w-4 text-wine-600 dark:text-wine-400" />
              <h2 className="font-serif text-base font-bold text-gray-900 dark:text-white">
                {user?.name}&apos;s Profile
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Profile Photo URL
              </label>
              <input
                type="url"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Birthday
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-wine-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Change Passcode / Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 py-3.5 font-semibold text-white shadow-glow-wine transition hover:scale-[1.01] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving Settings..." : "Save Settings"}</span>
          </button>
        </form>

        {/* DANGER ZONE: RESET ONBOARDING */}
        <div className="rounded-3xl border border-rose-300 dark:border-rose-900/40 bg-white/70 dark:bg-night-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-serif text-sm font-bold">
              Relationship Rulebook Management
            </h3>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Need to restart or experience the 10 Wishes Onboarding again together? This destructive action requires explicit confirmation.
          </p>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 px-4 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Wishes &amp; Re-experience Onboarding</span>
          </button>
        </div>
      </main>

      {/* CONFIRMATION MODAL FOR DESTRUCTIVE RESET */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-rose-500/50 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                ⚠️ Confirm Onboarding Reset
              </h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
              This will unlock your wishes and allow you to re-craft and re-lock your 10 relationship wishes from scratch.
            </p>

            <div className="my-4 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-night-850 p-3 text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetBoth}
                  onChange={(e) => setResetBoth(e.target.checked)}
                  className="rounded border-gray-400 bg-white text-rose-600 focus:ring-0"
                />
                <span>Reset for both Vandan &amp; Muskaan (clean slate)</span>
              </label>
            </div>

            <div className="space-y-1.5 my-4">
              <label className="block text-xs font-semibold text-rose-600 dark:text-rose-300">
                Type &quot;RESET_OUR_WISHES&quot; below to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET_OUR_WISHES"
                className="w-full rounded-xl border border-rose-300 dark:border-rose-500/40 bg-gray-50 dark:bg-night-850 px-3 py-2 font-mono text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetOnboarding}
                disabled={confirmText !== "RESET_OUR_WISHES" || isResetting}
                className="rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-glow-wine hover:opacity-90 disabled:opacity-40"
              >
                {isResetting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
