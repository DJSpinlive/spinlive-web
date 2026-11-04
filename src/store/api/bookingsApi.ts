import {
  Booking,
  BookingAvailability,
  BookingHistoryEntry,
  BookingReview,
  BookingReviewRequest,
  CreateBookingRequest,
  GetBookingsParams,
  GetBookingsResponse,
} from "@/types/bookings.types";
import { BASE_PATHS } from "@/utilities";
import { removeEmptyParams } from "@/utilities/helpers";

import { baseSlice } from "./apiSlice";

export const bookingsApi = baseSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBookings: builder.query<GetBookingsResponse, GetBookingsParams>({
      query: (params) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}`,
        method: "GET",
        params: removeEmptyParams(params),
      }),
      providesTags: ["Bookings"],
    }),
    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (booking) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}`,
        method: "POST",
        body: booking,
      }),
      invalidatesTags: ["Bookings"],
    }),
    getBookingDetails: builder.query<Booking, string>({
      query: (id) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Bookings", id }],
    }),

    deleteBooking: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${id}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Bookings", id },
        "Bookings",
      ],
    }),

    getBookingAvailability: builder.query<
      BookingAvailability,
      { djId: string; date: string }
    >({
      query: ({ djId, date }) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/djs/${djId}/availability`,
        method: "GET",
        params: removeEmptyParams({ date }),
      }),
    }),

    /** Day-by-day availability; the API caps the range at 31 days. */
    getBookingAvailabilityRange: builder.query<
      BookingAvailability[],
      { djId: string; startDate: string; endDate: string }
    >({
      query: ({ djId, startDate, endDate }) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/djs/${djId}/availability/range`,
        method: "GET",
        params: removeEmptyParams({ startDate, endDate }),
      }),
    }),

    /** End user accepts the DJ's quote (awaiting_end_user_confirmation -> confirmed). */
    acceptBookingQuote: builder.mutation<Booking, string>({
      query: (id) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${id}/accept`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Bookings", id },
        "Bookings",
      ],
    }),

    /** End user rejects the DJ's quote. */
    declineBookingQuote: builder.mutation<Booking, string>({
      query: (id) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${id}/decline`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Bookings", id },
        "Bookings",
      ],
    }),

    getBookingHistory: builder.query<BookingHistoryEntry[], string>({
      query: (id) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${id}/history`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Bookings", id }],
    }),

    /** 404 when the booking has no review yet. */
    getBookingReview: builder.query<BookingReview, string>({
      query: (id) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${id}/review`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "BookingReview", id }],
    }),

    /** Completed bookings only; one review per booking (409 on a second POST). */
    createBookingReview: builder.mutation<BookingReview, BookingReviewRequest>({
      query: ({ bookingId, ...body }) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${bookingId}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "BookingReview", id: bookingId },
        "BookingReview",
      ],
    }),

    updateBookingReview: builder.mutation<BookingReview, BookingReviewRequest>({
      query: ({ bookingId, ...body }) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/${bookingId}/review`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "BookingReview", id: bookingId },
        "BookingReview",
      ],
    }),

    getDjBookingReviews: builder.query<BookingReview[], string>({
      query: (djId) => ({
        url: `${BASE_PATHS.BOOKINGS_SERVICE}/djs/${djId}/reviews`,
        method: "GET",
      }),
      providesTags: ["BookingReview"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useGetBookingDetailsQuery,
  useDeleteBookingMutation,
  useGetBookingAvailabilityQuery,
  useGetBookingAvailabilityRangeQuery,
  useAcceptBookingQuoteMutation,
  useDeclineBookingQuoteMutation,
  useGetBookingHistoryQuery,
  useGetBookingReviewQuery,
  useCreateBookingReviewMutation,
  useUpdateBookingReviewMutation,
  useGetDjBookingReviewsQuery,
} = bookingsApi;
