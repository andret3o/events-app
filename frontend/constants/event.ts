import { EventCategory } from "@/types/event";

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; emoji: string; badgeClass: string; bgClass: string }
> = {
  NIGHTLIFE: {
    label: "Nightlife",
    emoji: "🌙",
    badgeClass:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    bgClass: "from-violet-500/20 to-violet-500/5",
  },
  MUSIC: {
    label: "Music",
    emoji: "🎵",
    badgeClass:
      "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
    bgClass: "from-pink-500/20 to-pink-500/5",
  },
  TECH: {
    label: "Tech",
    emoji: "💻",
    badgeClass:
      "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    bgClass: "from-sky-500/20 to-sky-500/5",
  },
  SPORT: {
    label: "Sport",
    emoji: "⚡",
    badgeClass:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    bgClass: "from-green-500/20 to-green-500/5",
  },
  SOCIAL: {
    label: "Social",
    emoji: "🤝",
    badgeClass:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    bgClass: "from-amber-500/20 to-amber-500/5",
  },
  EDUCATIONAL: {
    label: "Educational",
    emoji: "📚",
    badgeClass:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
    bgClass: "from-teal-500/20 to-teal-500/5",
  },
  ART: {
    label: "Art",
    emoji: "🎨",
    badgeClass:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    bgClass: "from-orange-500/20 to-orange-500/5",
  },
  OTHER: {
    label: "Other",
    emoji: "✦",
    badgeClass: "bg-muted text-muted-foreground border-border",
    bgClass: "from-muted/60 to-muted/10",
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[];
