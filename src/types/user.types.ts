import { AvailabilityWindow } from "./bookings.types";

export interface User {
  id: string;
  email: string;
  /** Public handle — present when `/me` returns it. */
  username?: string | null;
  display_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  /** ISO date (YYYY-MM-DD); must be in the past. */
  date_of_birth?: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: "end_user" | "dj" | "admin";
  genres: string[];
  hourly_rate: number | null;
  location: string | null;
  is_live: boolean;
  kyc_verified: boolean;
  rating_avg: number;
  rating_count: number;
  status: string; // e.g. 'active'
  availability: AvailabilityWindow[];
  is_public?: boolean;
  onboarding_completed?: boolean;
  terms_version?: string | null;
  terms_accepted_at?: string | null;
  bookings_created_count?: number;
  following_count?: number;
  tips_sent_count?: number;
  /** DJ detail: whether the current viewer follows this DJ */
  is_following?: boolean;
  followers_count?: number;
  follower_count?: number;
  bookings_count?: number;
  total_bookings?: number;
  completed_bookings?: number;
}

export interface UpdateUserRequest {
  display_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  /** ISO date (YYYY-MM-DD); `null` clears it. */
  date_of_birth?: string | null;
  bio?: string;
  genres?: string[];
  hourly_rate?: number;
  location?: string;
  avatarUrl?: string;
  /** Omit to leave unchanged; `null` clears when the API supports it. */
  avatar_url?: string | null;
}

export interface UploadUserAvatarResponse {
  avatar_url: string;
  content_type: string;
  size_bytes: number;
}

export interface DiscoverDjsParams {
  search?: string;
  genre?: string;
  min_rating?: number;
  location?: string;
  is_live?: boolean;
  limit?: number; // maximum: 100
  offset?: number; // minimum: 0
}

/** Normalized client shape — API returns either a raw DJ array or `{ djs: [...] }` (no pagination metadata). */
export interface DiscoverDjsResponse {
  djs: User[];
}

/** `/users/djs/recommended` row: a DJ ranked by genre overlap with the viewer. */
export interface MatchedDj extends User {
  match_score: number;
  shared_genres: string[];
}

export interface RecommendedDjsParams {
  limit?: number; // maximum: 100
  offset?: number; // minimum: 0
}

export interface AcceptTermsRequest {
  version: string;
}

export interface Genre {
  id: number;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface UpdateGenrePreferencesRequest {
  genre_slugs: string[];
}

export type GenrePreferences = Genre[];
