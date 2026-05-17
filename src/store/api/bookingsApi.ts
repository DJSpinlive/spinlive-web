import {
  Booking,
  BookingAvailability,
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
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useGetBookingDetailsQuery,
  useDeleteBookingMutation,
  useGetBookingAvailabilityQuery,
} = bookingsApi;
