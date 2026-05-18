"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { EditPencilIcon } from "@/components/assets";
import { RemoteAvatarImage } from "@/components/RemoteAvatarImage/RemoteAvatarImage";
import { FormButton } from "@/components/ui/form-button";
import { FormInput } from "@/components/ui/form-input";
import { cn } from "@/lib/utils";
import {
  useGetUserQuery,
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
} from "@/store/api";
import type { User } from "@/types/user.types";
import { getErrorMessage } from "@/utilities/helpers";

const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop";

interface EditProfileFormValues {
  displayName: string;
  username: string;
  email: string;
  city: string;
  bio: string;
}

const editProfileSchema: yup.ObjectSchema<EditProfileFormValues> = yup.object({
  displayName: yup
    .string()
    .defined()
    .trim()
    .max(120, "Full name must be at most 120 characters")
    .test(
      "min-if-provided",
      "Full name must be at least 2 characters when provided",
      (v) => v.length === 0 || v.length >= 2
    ),
  username: yup
    .string()
    .defined()
    .trim()
    .max(50, "Username must be at most 50 characters")
    .test(
      "handle",
      "Use letters, numbers, underscores, or hyphens.",
      (v) => v.length === 0 || /^[a-zA-Z0-9_-]+$/.test(v)
    ),
  email: yup
    .string()
    .defined()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  city: yup
    .string()
    .defined()
    .trim()
    .max(120, "Location must be at most 120 characters"),
  bio: yup
    .string()
    .defined()
    .trim()
    .max(2000, "Bio must be at most 2000 characters"),
});

function readOptionalString(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function usernameSeedForForm(user: User): string {
  const emailLocal = user.email?.split("@")[0] ?? "";
  const uname = readOptionalString(Reflect.get(user, "username"));
  if (!uname?.length) return emailLocal;
  const trimmed = uname.trim();
  return trimmed.length > 0 ? trimmed : emailLocal;
}

function defaultValuesFromUser(user: User): EditProfileFormValues {
  return {
    displayName: user.display_name?.trim() ?? "",
    username: usernameSeedForForm(user),
    email: user.email ?? "",
    city: user.location?.trim() ?? "",
    bio: user.bio?.trim() ?? "",
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydratedUserIdRef = useRef<string | null>(null);

  const { data: user, isLoading, isError, refetch } = useGetUserQuery();
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadUserAvatarMutation();

  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      city: "",
      bio: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!user) return;
    if (hydratedUserIdRef.current === user.id) return;
    hydratedUserIdRef.current = user.id;
    reset(defaultValuesFromUser(user));
  }, [user, reset]);

  const watchedDisplayName = watch("displayName");
  const displayNameHeading = watchedDisplayName?.trim().length
    ? watchedDisplayName.trim()
    : "Your profile";

  const triggerAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }

    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadAvatar(formData).unwrap();
    } catch (error: unknown) {
      setAvatarError(
        getErrorMessage(error, {
          fallbackMessage:
            "Could not upload photo. Try again or pick another image.",
        })
      );
    }
  };

  const onSubmit: SubmitHandler<EditProfileFormValues> = async (values) => {
    if (!user) return;

    setSaveError(null);
    try {
      const displayNameTrimmed = values.displayName.trim();
      const usernameTrimmed = values.username.trim();
      const bioTrimmed = values.bio.trim();
      const cityTrimmed = values.city.trim();
      await updateUser({
        display_name:
          displayNameTrimmed.length > 0 ? displayNameTrimmed : undefined,
        username: usernameTrimmed.length > 0 ? usernameTrimmed : undefined,
        bio: bioTrimmed,
        location: cityTrimmed.length > 0 ? cityTrimmed : undefined,
      }).unwrap();

      router.push("/profile");
    } catch (error: unknown) {
      setSaveError(
        getErrorMessage(error, {
          fallbackMessage:
            "Could not save changes. Check fields and try again.",
        })
      );
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 pb-10">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
        <p className="text-sm text-[#9ca3af]">Loading profile…</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 pb-10 text-center">
        <p className="text-lg font-semibold text-white">
          Could not load edit form
        </p>
        <p className="max-w-md text-sm text-[#9ca3af]">
          Check your connection or sign in again, then retry.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7c4ddb]"
        >
          Retry
        </button>
      </div>
    );
  }

  const busyForm = isSaving || isUploadingAvatar || isSubmitting;

  return (
    <div className="pb-10">
      <div className="mb-6">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-sm text-[#8b95b0] transition hover:text-white"
        >
          ← Back to profile
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">Edit Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-[#1e2536] bg-[#0d1117] p-6">
            <h2 className="text-lg font-semibold text-white">Profile Photo</h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Update your public photo and preview your profile card.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-hidden
              onChange={handleAvatarChange}
            />

            <div className="mt-5 flex flex-col items-center rounded-xl border border-[#1e2536] bg-[#0b1018] p-5">
              <RemoteAvatarImage
                uri={user.avatar_url ?? ""}
                fallbackUri={AVATAR_FALLBACK}
                alt={displayNameHeading}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-[#1e2536]"
              />

              <FormButton
                type="button"
                disabled={busyForm}
                className="mt-4 bg-[#1a2234] hover:bg-[#242f44]"
                onClick={triggerAvatarPick}
              >
                {isUploadingAvatar ? "Uploading…" : "Change Photo"}
              </FormButton>
              {avatarError ? (
                <p className="mt-2 text-center text-sm text-[#fca5a5]">
                  {avatarError}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <form
          className="space-y-6 rounded-2xl border border-[#1e2536] bg-[#0d1117] p-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {saveError ? (
            <p className="rounded-xl border border-[#7f1d1d]/50 bg-[#450a0a]/40 px-4 py-3 text-sm text-[#fca5a5]">
              {saveError}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              {...register("displayName")}
              label="Full name"
              placeholder="Enter your full name"
              error={errors.displayName?.message}
            />
            <FormInput
              {...register("username")}
              label="Username"
              placeholder="Enter username"
              error={errors.username?.message}
              rightAdornment={
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8b95b0]">
                  @
                </span>
              }
            />
            <FormInput
              {...register("email")}
              type="email"
              label="Email"
              placeholder="your@email.com"
              error={errors.email?.message}
              readOnly
              className="cursor-not-allowed opacity-80"
            />
            <p className="sm:col-span-2 rounded-xl border border-dashed border-[#2d3548] bg-[#0b1018] px-4 py-3 text-sm text-[#6b7280]">
              Phone number updates are available in the SpinLive mobile app.
            </p>
          </div>

          <FormInput
            {...register("city")}
            label="City"
            placeholder="City or region"
            error={errors.city?.message}
          />

          <div>
            <p className="mb-2 block text-sm font-medium text-[#e7ebf5]">Bio</p>
            <textarea
              {...register("bio")}
              rows={5}
              placeholder="Tell people a little about yourself..."
              className={cn(
                "w-full resize-none rounded-xl border px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#5f6983] focus:border-[#4e5e92]",
                "border-transparent bg-[#04142a]",
                errors.bio ? "border-[#f87171]" : ""
              )}
            />
            {errors.bio ? (
              <p className="mt-1 text-sm text-[#fca5a5]">
                {errors.bio.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-[#1e2536] pt-6 sm:flex-row sm:justify-end">
            <Link href="/profile" className="w-full sm:w-auto">
              <FormButton
                type="button"
                className="border border-[#1e2536] bg-transparent px-6 hover:border-[#2d3548] hover:bg-[#141a24]"
              >
                Cancel
              </FormButton>
            </Link>
            <FormButton
              type="submit"
              disabled={busyForm}
              className="w-full bg-[#8b5cf6] px-6 hover:bg-[#7c4ddb] sm:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                <EditPencilIcon className="h-4 w-4" />
                {isSaving ? "Saving…" : "Save changes"}
              </span>
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
}
