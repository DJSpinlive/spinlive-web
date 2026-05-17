"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { EditPencilIcon } from "@/components/assets";
import { FormButton } from "@/components/ui/form-button";
import { FormInput } from "@/components/ui/form-input";

const initialProfile = {
  fullName: "Alex Morgan",
  username: "alexmixesfan",
  email: "alex@spinsync.app",
  phone: "+1 (555) 123-0091",
  city: "New York, NY",
  bio: "A fan-first account for discovering live DJ sets, sending requests, and booking unforgettable events.",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
};

export default function EditProfilePage() {
  const [profile, setProfile] = useState(initialProfile);

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

            <div className="mt-5 flex flex-col items-center rounded-xl border border-[#1e2536] bg-[#0b1018] p-5">
              <Image
                src={profile.avatar}
                alt={profile.fullName}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-[#1e2536]"
                unoptimized
              />
              <FormButton className="mt-4 bg-[#1a2234] hover:bg-[#242f44]">
                Change Photo
              </FormButton>
            </div>
          </div>
        </div>

        <form className="space-y-6 rounded-2xl border border-[#1e2536] bg-[#0d1117] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="fullName"
              label="Full name"
              placeholder="Enter your full name"
              value={profile.fullName}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
            <FormInput
              name="username"
              label="Username"
              placeholder="Enter username"
              value={profile.username}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, username: e.target.value }))
              }
              rightAdornment={
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8b95b0]">
                  @
                </span>
              }
            />
            <FormInput
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={profile.email}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <FormInput
              name="phone"
              label="Phone number"
              placeholder="Enter your phone number"
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <FormInput
            name="city"
            label="City"
            placeholder="Enter your city"
            value={profile.city}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, city: e.target.value }))
            }
          />

          <div>
            <p className="mb-2 block text-sm font-medium text-[#e7ebf5]">Bio</p>
            <textarea
              name="bio"
              rows={5}
              placeholder="Tell people a little about yourself..."
              value={profile.bio}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="w-full resize-none rounded-xl border border-transparent bg-[#04142a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#5f6983] focus:border-[#4e5e92]"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-[#1e2536] pt-6 sm:flex-row sm:justify-end">
            <Link href="/profile" className="w-full sm:w-auto">
              <FormButton className="border border-[#1e2536] bg-transparent px-6 hover:border-[#2d3548] hover:bg-[#141a24]">
                Cancel
              </FormButton>
            </Link>
            <FormButton className="w-full bg-[#8b5cf6] px-6 hover:bg-[#7c4ddb] sm:w-auto">
              <span className="inline-flex items-center gap-2">
                <EditPencilIcon className="h-4 w-4" />
                Save changes
              </span>
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
}
