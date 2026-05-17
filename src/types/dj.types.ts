export interface DjReview {
  id: string;
  dj_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
}

export type GetDjReviewsResponse = DjReview[];
