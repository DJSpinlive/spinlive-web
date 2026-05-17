import { AvailabilityWindow } from "./bookings.types";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
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
  username?: string;
  display_name?: string;
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

export interface DiscoverDjsResponse {
  djs: User[];
  total?: number;
  limit?: number;
  offset?: number;
  has_more?: boolean;
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
