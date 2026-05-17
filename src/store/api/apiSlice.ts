import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { logout, refreshTokenSuccess } from "@/store/slices/authSlice";
import {
  clearAllAuthCookies,
  getClientCookie,
  setRefreshTokenToCookie,
  setTokenToCookie,
} from "@/utilities/clientCookies";
import { AUTH_COOKIE_NAMES, ENV_VARS } from "@/utilities/constants";

const baseQuery = fetchBaseQuery({
  baseUrl: ENV_VARS.API_URL,
  prepareHeaders: (headers) => {
    const token = getClientCookie(AUTH_COOKIE_NAMES.token);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Check if the response is a 401 Unauthorized
  if (result.error && result.error.status === 401) {
    // Check if refresh token exists
    const refreshToken = getClientCookie(AUTH_COOKIE_NAMES.refreshToken);

    if (refreshToken && typeof window !== "undefined") {
      try {
        // Attempt to refresh token
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: {},
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const refreshData = refreshResult.data as {
            access_token: string;
            token_type: string;
            refresh_token?: string;
          };

          // Update tokens in store and cookies
          api.dispatch(
            refreshTokenSuccess({
              token: refreshData.access_token,
              refreshToken: refreshData.refresh_token,
            })
          );

          // Update cookies
          setTokenToCookie(refreshData.access_token);
          if (refreshData.refresh_token) {
            setRefreshTokenToCookie(refreshData.refresh_token);
          }

          // Retry original request with new token
          const retryHeaders = new Headers();
          retryHeaders.set(
            "Authorization",
            `Bearer ${refreshData.access_token}`
          );
          retryHeaders.set("Content-Type", "application/json");

          if (typeof args === "string") {
            result = await baseQuery(
              {
                url: args,
                method: "GET",
              },
              api,
              extraOptions
            );
          } else {
            result = await baseQuery(args, api, extraOptions);
          }

          return result;
        }
        // Refresh failed - logout
        clearAllAuthCookies();
        api.dispatch(logout());
        window.location.href = "/sign-in";
      } catch {
        // Refresh error - logout
        clearAllAuthCookies();
        api.dispatch(logout());
        window.location.href = "/sign-in";
      }
    } else if (typeof window !== "undefined") {
      // No refresh token or not in browser - logout
      clearAllAuthCookies();
      api.dispatch(logout());
      window.location.href = "/sign-in";
    }
  }

  return result;
};

export const baseSlice = createApi({
  reducerPath: "api",
  tagTypes: [
    "User",
    "Auth",
    "DjsList",
    "DjsDetails",
    "DjReviews",
    "GenrePreferences",
    "Bookings",
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});

// Base slice with no endpoints - endpoints are added via injectEndpoints
