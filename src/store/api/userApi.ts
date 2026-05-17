import {
  UpdateUserRequest,
  UploadUserAvatarResponse,
  User,
} from "@/types/user.types";
import { BASE_PATHS } from "@/utilities";

import { baseSlice } from "./apiSlice";

export const userApi = baseSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({
      query: () => `${BASE_PATHS.USER_SERVICE}/me`,
      providesTags: ["User"],
    }),

    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: (user) => ({
        url: `${BASE_PATHS.USER_SERVICE}/me`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: ["User"],
    }),

    uploadUserAvatar: builder.mutation<UploadUserAvatarResponse, FormData>({
      query: (formData) => ({
        url: `${BASE_PATHS.USER_SERVICE}/me/avatar`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
} = userApi;
