/**
 * TAFAT category surfaces.
 *
 * Central, typed source for the illustrated category cards used on the
 * homepage ("Browse by category") and the Health & Wellness category page.
 *
 * `status` is "live" for categories that exist today (Digital catalog filter,
 * Health & Wellness page) and "soon" for the owner's planned future categories
 * (Technology, Coffee, Books, Art). "soon" cards are rendered as non-link
 * preview cards so visitors are never sent to dead pages, and no fabricated
 * products or rankings are shown.
 */

export type CategoryStatus = "live" | "soon";

export type HomeCategory = {
  id: string;
  name: string;
  tagline: string;
  /** Illustration key in `illustrationByKey`. */
  art: string;
  href: string | null;
  status: CategoryStatus;
  /** Tailwind-free accent class used by the card. */
  accent: string;
};

export const HOME_CATEGORIES: readonly HomeCategory[] = [
  {
    id: "digital",
    name: "Digital",
    tagline: "Software, courses and creator tools — researched before they earn a place here.",
    art: "digital",
    href: "/#discover",
    status: "live",
    accent: "peach",
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    tagline: "Evidence-led guides and practical wellbeing resources for everyday choices.",
    art: "health",
    href: "/health-wellness",
    status: "live",
    accent: "sage",
  },
  {
    id: "technology",
    name: "Technology",
    tagline: "Useful tech, considered calmly — coming soon to TAFAT.",
    art: "technology",
    href: null,
    status: "soon",
    accent: "sky",
  },
  {
    id: "coffee",
    name: "Coffee",
    tagline: "Brewing guides and honest gear notes — coming soon to TAFAT.",
    art: "coffee",
    href: null,
    status: "soon",
    accent: "gold",
  },
  {
    id: "books",
    name: "Books",
    tagline: "Reading worth your shelf space — coming soon to TAFAT.",
    art: "books",
    href: null,
    status: "soon",
    accent: "lilac",
  },
  {
    id: "art",
    name: "Art",
    tagline: "Tools and inspiration for making — coming soon to TAFAT.",
    art: "art",
    href: null,
    status: "soon",
    accent: "moss",
  },
] as const;

export type HealthTopic = {
  id: string;
  name: string;
  copy: string;
  art: string;
  href: string;
};

/** Six wellness topics on the Health & Wellness category page. */
export const HEALTH_TOPICS: readonly HealthTopic[] = [
  {
    id: "vitamins-minerals",
    name: "Vitamins & Minerals",
    copy: "Everyday information to help you compare options with care.",
    art: "vitamins",
    href: "/health-wellness/the-complete-guide-to-magnesium",
  },
  {
    id: "sleep-rest",
    name: "Sleep & Rest",
    copy: "Gentle ideas and resources for building a more restful routine.",
    art: "sleep",
    href: "#coming-soon",
  },
  {
    id: "gut-health",
    name: "Gut Health",
    copy: "Practical reading and recommendations for informed choices.",
    art: "gut",
    href: "#coming-soon",
  },
  {
    id: "hydration-electrolytes",
    name: "Hydration & Electrolytes",
    copy: "Explore hydration tools and straightforward guidance.",
    art: "hydration",
    href: "#coming-soon",
  },
  {
    id: "healthy-movement",
    name: "Healthy Movement",
    copy: "Approachable resources for adding movement to real life.",
    art: "movement",
    href: "#coming-soon",
  },
  {
    id: "general-wellness",
    name: "General Wellness",
    copy: "Thoughtful wellbeing finds for your everyday routine.",
    art: "general",
    href: "#coming-soon",
  },
] as const;
