export type PaymentStatus =
  | "requires_payment_method"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export type TransactionType = "tip" | "booking" | "refund";

/** `POST /payments/payment-methods/setup-session` */
export interface SetupSessionResponse {
  setupIntentId: string;
  setupIntentClientSecret: string;
  customerSessionClientSecret: string;
  stripeCustomerId: string;
}

/** Shared shape of `POST /payments/tips` and `POST /payments/bookings/{id}/pay`. */
export interface PaymentIntentResponse {
  transactionId: string;
  paymentIntentId: string;
  /** Confirm with Stripe.js unless `status` is already `succeeded`. */
  clientSecret: string;
  /** Amount in minor units (e.g. cents). */
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  requiresAction: boolean;
}

export interface CreateTipRequest {
  streamId: string;
  /** Amount in minor units (e.g. cents). */
  amountMinor: number;
  currency?: string;
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
  /** Sent as the `Idempotency-Key` header; use a fresh key per attempt. */
  idempotencyKey: string;
}

export type CreateTipResponse = PaymentIntentResponse;

export interface PayBookingRequest {
  bookingId: string;
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
}

export interface PayBookingResponse extends PaymentIntentResponse {
  bookingId: string;
}

/** `GET /payments/transactions` item and `GET /payments/bookings/{id}` */
export interface Transaction {
  id: string;
  type: TransactionType;
  status: PaymentStatus;
  fanId: string;
  djId: string;
  streamId?: string | null;
  bookingId?: string | null;
  amountMinor: number;
  platformFeeMinor?: number | null;
  netToDjMinor?: number | null;
  currency: string;
  fromUserName?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

/** `GET /payments/subscriptions/current` */
export interface CurrentSubscription {
  subscriptionId?: string | null;
  plan?: string | null;
  status?: SubscriptionStatus | null;
  entitled?: boolean;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEnd?: string | null;
  entitlementActiveUntil?: string | null;
}

/** Stripe-hosted page (subscription checkout or billing portal). */
export interface StripeSessionResponse {
  sessionId: string;
  url: string;
  plan?: string;
}
