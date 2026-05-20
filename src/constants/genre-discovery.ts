/** Primary accent aligned with SpinLive filter tabs / CTAs (#8b5cf6 violet). */
export const FILTER_TAB_PRIMARY = "#8b5cf6";

/** Display label → API slug (mobile `DISCOVER_GENRE_FILTERS`). */
export const DISCOVER_GENRE_FILTERS = [
  { label: "House", apiGenre: "house" },
  { label: "Techno", apiGenre: "techno" },
  { label: "Hip Hop", apiGenre: "hip-hop" },
  { label: "R&B", apiGenre: "rnb" },
  { label: "EDM", apiGenre: "edm" },
  { label: "Trance", apiGenre: "trance" },
  { label: "Dubstep", apiGenre: "dubstep" },
  { label: "Drum & Bass", apiGenre: "drum-and-bass" },
  { label: "Afrobeat", apiGenre: "afrobeat" },
] as const;

export type DiscoverGenreSlug =
  (typeof DISCOVER_GENRE_FILTERS)[number]["apiGenre"];
