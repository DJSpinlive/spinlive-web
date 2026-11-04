import type {
  CreateTipRequest,
  CreateTipResponse,
  CurrentSubscription,
  PayBookingRequest,
  PayBookingResponse,
  SetupSessionResponse,
  StripeSessionResponse,
  Transaction,
} from "@/types/payments.types";
import { BASE_PATHS } from "@/utilities";

import { baseSlice } from "./apiSlice";

export const paymentsApi = baseSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /** SetupIntent + CustomerSession used to add or remove saved cards. */
    createSetupSession: builder.mutation<SetupSessionResponse, void>({
      query: () => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/payment-methods/setup-session`,
        method: "POST",
      }),
    }),

    createTip: builder.mutation<CreateTipResponse, CreateTipRequest>({
      query: ({ idempotencyKey, ...body }) => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/tips`,
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body,
      }),
      invalidatesTags: ["Transactions"],
    }),

    /** Only valid while the booking is `awaiting_payment`. */
    payBooking: builder.mutation<PayBookingResponse, PayBookingRequest>({
      query: ({ bookingId, ...body }) => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/bookings/${bookingId}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "BookingPayment", id: bookingId },
        "Transactions",
      ],
    }),

    /** 404 until a payment has been started for the booking. */
    getBookingPayment: builder.query<Transaction, string>({
      query: (bookingId) => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/bookings/${bookingId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, bookingId) => [
        { type: "BookingPayment", id: bookingId },
      ],
    }),

    getTransactions: builder.query<Transaction[], void>({
      query: () => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/transactions`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        Array.isArray(response) ? (response as Transaction[]) : [],
      providesTags: ["Transactions"],
    }),

    getCurrentSubscription: builder.query<CurrentSubscription, void>({
      query: () => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/subscriptions/current`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),

    createSubscriptionCheckout: builder.mutation<
      StripeSessionResponse,
      { plan: string }
    >({
      query: (body) => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/subscriptions/checkout-session`,
        method: "POST",
        body,
      }),
    }),

    createSubscriptionPortal: builder.mutation<StripeSessionResponse, void>({
      query: () => ({
        url: `${BASE_PATHS.PAYMENTS_SERVICE}/subscriptions/portal-session`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useCreateSetupSessionMutation,
  useCreateTipMutation,
  usePayBookingMutation,
  useGetBookingPaymentQuery,
  useGetTransactionsQuery,
  useGetCurrentSubscriptionQuery,
  useCreateSubscriptionCheckoutMutation,
  useCreateSubscriptionPortalMutation,
} = paymentsApi;
