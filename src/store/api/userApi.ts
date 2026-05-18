import {
  UpdateUserRequest,
  UploadUserAvatarResponse,
  User,
} from "@/types/user.types";
import { BASE_PATHS } from "@/utilities";

import { baseSlice } from "./apiSlice";

/** Accept bare `User` or `{ user | profile | data }` wrappers from `/me`. */
function normalizeMePayload(raw: unknown): User {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const nested = [o.user, o.profile, o.data];
    const hit = nested.find(
      (n) =>
        n &&
        typeof n === "object" &&
        typeof (n as { id?: unknown }).id === "string"
    );
    if (hit && typeof hit === "object") {
      return hit as User;
    }
    if (typeof o.id === "string") {
      return o as unknown as User;
    }
  }
  return raw as User;
}

export const userApi = baseSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({
      query: () => `${BASE_PATHS.USER_SERVICE}/me`,
      transformResponse: (response: unknown) => normalizeMePayload(response),
      providesTags: ["User"],
    }),

    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: (user) => ({
        url: `${BASE_PATHS.USER_SERVICE}/me`,
        method: "PUT",
        body: user,
      }),
      transformResponse: (response: unknown) => normalizeMePayload(response),
      invalidatesTags: ["User"],
    }),

    uploadUserAvatar: builder.mutation<UploadUserAvatarResponse, FormData>({
      query: (formData) => ({
        url: `${BASE_PATHS.USER_SERVICE}/me/avatar`,
        method: "POST",
        body: formData,
      }),
      transformResponse: (raw: unknown) => {
        if (raw && typeof raw === "object") {
          const o = raw as Record<string, unknown>;
          const nested = [o.data, o.user, o.profile];
          const hit = nested.find(
            (n) =>
              n &&
              typeof n === "object" &&
              typeof (n as { avatar_url?: unknown }).avatar_url === "string"
          );
          if (hit) {
            return hit as UploadUserAvatarResponse;
          }
          if (typeof o.avatar_url === "string") {
            return o as unknown as UploadUserAvatarResponse;
          }
        }
        return raw as UploadUserAvatarResponse;
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
} = userApi;
