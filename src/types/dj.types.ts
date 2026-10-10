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
