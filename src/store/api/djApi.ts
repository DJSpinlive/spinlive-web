import type {
  DjRelationship,
  DjReview,
  FavoriteDjResponse,
  FollowDjResponse,
  GetDjReviewsResponse,
  ReviewDjRequest,
  ReviewDjResponse,
} from "@/types/dj.types";
import {
  DiscoverDjsParams,
  DiscoverDjsResponse,
  MatchedDj,
  RecommendedDjsParams,
  User,
} from "@/types/user.types";
import { BASE_PATHS } from "@/utilities";
import { removeEmptyParams } from "@/utilities/helpers";

import { baseSlice } from "./apiSlice";

export const djApi = baseSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    discoverDjs: builder.query<DiscoverDjsResponse, DiscoverDjsParams>({
      query: (params) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs`,
        method: "GET",
        params: removeEmptyParams(params) as Record<string, unknown>,
      }),
      /** Accepts `{ djs }` or raw `User[]` from `/users/djs`. */
      transformResponse: (response: User[] | DiscoverDjsResponse) => {
        if (Array.isArray(response)) {
          return { djs: response };
        }
        return {
          djs: Array.isArray(response?.djs) ? response.djs : [],
        };
      },
      providesTags: ["DjsList"],
    }),

    /** DJs ranked by genre overlap with the viewer's preferences (U-11). */
    getRecommendedDjs: builder.query<MatchedDj[], RecommendedDjsParams>({
      query: (params) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/recommended`,
        method: "GET",
        params: removeEmptyParams(params) as Record<string, unknown>,
      }),
      transformResponse: (response: unknown) =>
        Array.isArray(response) ? (response as MatchedDj[]) : [],
      providesTags: ["RecommendedDjs"],
    }),

    djDetail: builder.query<User, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "DjsDetails", id }],
    }),

    followDj: builder.mutation<FollowDjResponse, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}/follow`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "DjsDetails", id },
        { type: "DjRelationship", id },
        "DjsList",
        "Follows",
      ],
    }),

    unFollowDj: builder.mutation<FollowDjResponse, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "DjsDetails", id },
        { type: "DjRelationship", id },
        "DjsList",
        "Follows",
      ],
    }),

    /** Viewer's follow/favorite state and shared genres for one DJ. */
    getDjRelationship: builder.query<DjRelationship, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}/relationship`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "DjRelationship", id }],
    }),

    favoriteDj: builder.mutation<FavoriteDjResponse, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}/favorite`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "DjRelationship", id },
        "Favorites",
      ],
    }),

    unFavoriteDj: builder.mutation<FavoriteDjResponse, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}/favorite`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "DjRelationship", id },
        "Favorites",
      ],
    }),

    getMyFavoriteDjs: builder.query<User[], void>({
      query: () => ({
        url: `${BASE_PATHS.USER_SERVICE}/me/favorites`,
        method: "GET",
      }),
      providesTags: ["Favorites"],
    }),

    getMyFollowedDjs: builder.query<User[], void>({
      query: () => ({
        url: `${BASE_PATHS.USER_SERVICE}/me/follows`,
        method: "GET",
      }),
      providesTags: ["Follows"],
    }),

    getDjReviews: builder.query<GetDjReviewsResponse, { djId: string }>({
      query: ({ djId }) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${djId}/reviews`,
        method: "GET",
      }),
      transformResponse: (
        raw: DjReview[] | { reviews?: DjReview[] }
      ): GetDjReviewsResponse => {
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === "object" && Array.isArray(raw.reviews)) {
          return raw.reviews;
        }
        return [];
      },
      providesTags: (_result, _error, { djId }) => [
        { type: "DjReviews", id: djId },
      ],
    }),

    /** One review per DJ: a second POST returns 409, use `editMyReview`. */
    reviewDj: builder.mutation<ReviewDjResponse, ReviewDjRequest>({
      query: ({ djId, rating, comment }) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${djId}/reviews`,
        method: "POST",
        body: { rating, comment },
      }),
      invalidatesTags: (_result, _error, { djId }) => [
        { type: "DjsDetails", id: djId },
        { type: "DjReviews", id: djId },
      ],
    }),

    editMyReview: builder.mutation<ReviewDjResponse, ReviewDjRequest>({
      query: ({ djId, rating, comment }) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${djId}/reviews/me`,
        method: "PUT",
        body: { rating, comment },
      }),
      invalidatesTags: (_result, _error, { djId }) => [
        { type: "DjsDetails", id: djId },
        { type: "DjReviews", id: djId },
      ],
    }),
  }),
});

export const {
  useDiscoverDjsQuery,
  useDjDetailQuery,
  useFollowDjMutation,
  useUnFollowDjMutation,
  useGetDjReviewsQuery,
  useReviewDjMutation,
  useEditMyReviewMutation,
  useGetRecommendedDjsQuery,
  useGetDjRelationshipQuery,
  useFavoriteDjMutation,
  useUnFavoriteDjMutation,
  useGetMyFavoriteDjsQuery,
  useGetMyFollowedDjsQuery,
} = djApi;
