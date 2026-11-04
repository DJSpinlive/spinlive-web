export interface DjReview {
  /** `/users/djs/{id}/reviews` returns a numeric id; older payloads used strings. */
  id?: string | number;
  dj_id?: string;
  reviewer_id?: string;
  rating?: number;
  comment?: string;
  /** API may expose alternate text fields */
  content?: string;
  text?: string;
  /** Present only when the API enriches reviews with reviewer details. */
  reviewer_username?: string;
  reviewer_display_name?: string;
  reviewer_name?: string;
  reviewer_avatar_url?: string | null;
  created_at?: string | null;
}

export type GetDjReviewsResponse = DjReview[];

export interface ReviewDjRequest {
  djId: string;
  rating: number;
  comment: string;
}

export interface DjRelationship {
  dj_id: string;
  is_following: boolean;
  is_favorite: boolean;
  shared_genres: string[];
}

export interface FollowDjResponse {
  status: "followed" | "already_following" | "unfollowed" | "not_following";
  dj_id?: string | null;
}

export interface FavoriteDjResponse {
  status: "favorited" | "already_favorited" | "unfavorited" | "not_favorited";
  dj_id: string;
}

export interface ReviewDjResponse {
  status: "created" | "updated";
  review_id: number;
}
