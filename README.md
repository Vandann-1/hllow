# ❤️ VANDAN × MITTI
## Private Two-Person Relationship Sanctuary & Game

A private, secure web application built exclusively for **Vandan & Mitti**. Crafted with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and SQLite.

---

### ✨ Features Overview

1. **🔐 Strict Two-User Authentication & Privacy**
   - Strictly reserved for **Vandan** and **Mitti**.
   - No public registration, no third users, search engine indexing blocked via `robots.txt`.
   - Dual-perspective switcher allowing instant toggle between Vandan and Mitti.

2. **🚀 First-Login Experience & 10 Wishes Onboarding**
   - Emotional greeting & philosophy introduction.
   - Form presents **one wish at a time** with progress counter (`01 / 10`).
   - Categorized by Love, Communication, Trust, Time, Emotional, Effort, Fun, and Improvement.
   - Compact cards render dynamically below the form.
   - Strict 10-wish cap with review screen and confirmation modal.
   - Partner's wishes remain private until both partners lock their wishes.
   - Confetti celebration upon sealing the rulebook!

3. **🏠 Main Dashboard & Live Together Counter**
   - Live togetherness counter calculating Years, Months, and Days from the relationship start date (**07 October 2026**).
   - Real-time widgets for Relationship Level, Wishes Progress, Rule Streak, Relationship Fund, and Nearest Special Day.

4. **📝 20 Sacred Wishes Rulebook**
   - 10 wishes crafted by Vandan for Mitti + 10 crafted by Mitti for Vandan.
   - Status progression: *Active* → *In Progress* → *Completed* → *Permanently Adopted*.
   - Direct button on each card to report a broken wish.

5. **💰 ₹100 Rule-Breaking System & Shared Relationship Fund**
   - Recording a rule break adds **₹100** to the shared fund.
   - Current rule streak resets to **0 Days**, while preserving the best streak.
   - Contribution breakdown per partner.
   - Fund spending tracker for dates, movies, outings, gifts, and food.

6. **📅 Our Dates & Automatic Anniversaries**
   - Automatic calculation of yearly anniversaries (1 Year, 2 Years, 3 Years, etc.).
   - Live countdown timers on upcoming birthdays, festivals, love days, and milestones.
   - Modal to add custom special celebrations.

7. **📖 Our Story Timeline**
   - Romantic chronological timeline with dates, photos, locations, and emojis.

8. **💌 Love Letters**
   - Letters for special moments (*Open When You Miss Me*, *Open When We Fight*, etc.).
   - Scheduled unlock dates and emoji reactions.

9. **🎁 Surprise Vault**
   - Time-locked secret surprises hidden until an exact future date and time.

10. **🏆 Relationship Level & Shared Statistics**
    - Mutual progression (Level 1: Started to Level 5: Forever Mode).
    - Shared XP earned through milestones, fulfillment of wishes, and rule streaks.

---

### 🔑 User Credentials

| Partner | Username | Default Passcode |
| :--- | :--- | :--- |
| **Vandan** | `vandan` | `vandan123` |
| **Mitti** | `mitti` | `mitti123` |

*(Passcodes can be updated anytime in the Settings page).*

---

### 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark Luxury Obsidian & Rose Gold Theme)
- **Database:** SQLite with Prisma ORM
- **Session:** JWT with HTTP-only cookies (`jose`)
- **Effects:** Canvas Confetti, Lucide React Icons
