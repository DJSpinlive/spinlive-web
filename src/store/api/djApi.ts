import type { DjReview, GetDjReviewsResponse } from "@/types/dj.types";
import {
  DiscoverDjsParams,
  DiscoverDjsResponse,
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

    djDetail: builder.query<User, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "DjsDetails", id }],
    }),

    followDj: builder.mutation<void, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}/follow`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "DjsDetails", id },
        "DjsList",
      ],
    }),

    unFollowDj: builder.mutation<void, string>({
      query: (id) => ({
        url: `${BASE_PATHS.USER_SERVICE}/djs/${id}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "DjsDetails", id },
        "DjsList",
      ],
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

    reviewDj: builder.mutation<
      void,
      { djId: string; rating: number; comment: string }
    >({
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
  }),
});

export const {
  useDiscoverDjsQuery,
  useDjDetailQuery,
  useFollowDjMutation,
  useUnFollowDjMutation,
  useGetDjReviewsQuery,
  useReviewDjMutation,
} = djApi;
