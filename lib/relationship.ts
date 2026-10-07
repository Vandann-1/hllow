import { differenceInDays, differenceInCalendarYears, addYears, parseISO, isBefore, isAfter } from "date-fns";

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  description: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Started", minXp: 0, maxXp: 200, description: "The beginning of your timeless journey together." },
  { level: 2, title: "Getting Closer", minXp: 200, maxXp: 500, description: "Deepening your connection, trust, and shared rhythm." },
  { level: 3, title: "Growing Stronger", minXp: 500, maxXp: 1000, description: "Weathering storms, fulfilling wishes, holding hands tight." },
  { level: 4, title: "Strong Together", minXp: 1000, maxXp: 1800, description: "An unbreakable bond founded on deep understanding." },
  { level: 5, title: "Forever Mode", minXp: 1800, maxXp: 3000, description: "Two souls woven into one eternal masterpiece." },
];

export function calculateLevel(xp: number): {
  level: number;
  title: string;
  progressPercent: number;
  nextLevelXp: number;
  currentLevelXp: number;
} {
  let currentLevel = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) {
      currentLevel = lvl;
    }
  }

  const range = currentLevel.maxXp - currentLevel.minXp;
  const progress = Math.min(100, Math.max(0, Math.round(((xp - currentLevel.minXp) / range) * 100)));

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    progressPercent: progress,
    nextLevelXp: currentLevel.maxXp,
    currentLevelXp: xp,
  };
}

export interface TogetherTime {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formattedString: string;
}

export function calculateTogetherTime(startDateStr: string): TogetherTime {
  const start = new Date(startDateStr);
  const now = new Date();

  if (isNaN(start.getTime())) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      formattedString: "Just Begun",
    };
  }

  const totalDays = Math.max(0, differenceInDays(now, start));

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Year" : "Years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Month" : "Months"}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? "Day" : "Days"}`);

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays,
    formattedString: parts.join(" "),
  };
}

export interface UpcomingDateItem {
  id: string;
  title: string;
  category: string;
  emoji: string;
  targetDate: Date;
  daysLeft: number;
  isToday: boolean;
  formattedDate: string;
}

export function getUpcomingDates(
  specialDates: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    emoji: string;
  }>,
  relationshipStartDate: string
): UpcomingDateItem[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const items: UpcomingDateItem[] = [];

  // Add automatic yearly anniversaries for next 10 years
  const start = new Date(relationshipStartDate);
  if (!isNaN(start.getTime())) {
    for (let yr = 1; yr <= 10; yr++) {
      const annivDate = addYears(start, yr);
      const daysDiff = differenceInDays(annivDate, now);
      if (daysDiff >= 0 && daysDiff <= 365) {
        items.push({
          id: `anniversary-${yr}`,
          title: `${yr} ${yr === 1 ? "Year" : "Years"} Together 🥂`,
          category: "ANNIVERSARY",
          emoji: "🥂",
          targetDate: annivDate,
          daysLeft: daysDiff,
          isToday: daysDiff === 0,
          formattedDate: annivDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
        });
      }
    }
  }

  // Add special dates
  for (const item of specialDates) {
    let target: Date;
    if (item.date.includes("-") && item.date.length === 5) {
      // MM-DD
      const [m, d] = item.date.split("-").map(Number);
      target = new Date(currentYear, m - 1, d);
      if (isBefore(target, now) && differenceInDays(now, target) > 0) {
        target = new Date(currentYear + 1, m - 1, d);
      }
    } else {
      // YYYY-MM-DD
      target = new Date(item.date);
      if (isBefore(target, now)) {
        // Repeat next year if recurring
        const [y, m, d] = item.date.split("-").map(Number);
        target = new Date(currentYear, m - 1, d);
        if (isBefore(target, now) && differenceInDays(now, target) > 0) {
          target = new Date(currentYear + 1, m - 1, d);
        }
      }
    }

    const daysLeft = differenceInDays(target, now);
    if (daysLeft >= 0) {
      items.push({
        id: item.id,
        title: item.title,
        category: item.category,
        emoji: item.emoji,
        targetDate: target,
        daysLeft,
        isToday: daysLeft === 0,
        formattedDate: target.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
      });
    }
  }

  items.sort((a, b) => a.daysLeft - b.daysLeft);
  return items;
}
