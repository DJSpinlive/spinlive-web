import { User } from "./user.types";

export interface RegisterUserRequest {
  email: string; // must be a valid email
  password: string; // must be at least 8 characters
  display_name: string;
  role?: "end_user" | "dj" | "admin"; // optional, defaults to 'end_user'
  first_name?: string | null; // max 80
  last_name?: string | null; // max 80
  terms_version?: string | null; // max 40
}

/** Sign-up no longer returns tokens: the account must be verified with an emailed OTP first. */
export interface RegisterUserResponse {
  status?: string; // "verification_required"
  email: string;
  message?: string;
}

export interface LoginUserRequest {
  email: string; // must be a valid email
  password: string; // must be at least 8 characters
}

export interface LoginUserResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string; // Default "bearer"
  expires_in?: number; // Default 3600
  user: User;
}

export interface VerifyEmailRequest {
  email: string;
  code: string; // 6 digits
}

/** Body is untyped in the spec; tokens are used when present, otherwise the client logs in. */
export type VerifyEmailResponse = Partial<LoginUserResponse> & {
  status?: string;
};

export interface ResendVerificationRequest {
  email: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string; // Default "bearer"
  expires_in?: number; // Default 3600
}
