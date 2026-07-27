"use client";

import { useState } from "react";

import { useDiscoverDjsQuery } from "@/store/api";
import type { User } from "@/types/user.types";

import { DJ, DJCard } from "../_components/DJCard";
import { GenreTabs } from "../_components/GenreTabs";

const genres = [
  "All Genres",
  "House",
  "Techno",
  "Hip Hop",
  "R&B",
  "EDM",
  "Trance",
  "Dubstep",
  "Reggaeton",
  "Afrobeat",
];

function mapUserToDjCard(user: User): DJ {
  return {
    id: user.id,
    name: user.display_name || "Unnamed DJ",
    avatar: user.avatar_url || undefined,
    genres: user.genres?.length ? user.genres : ["All Genres"],
    rating: user.rating_avg || 0,
    reviewCount: user.rating_count || 0,
    hourlyRate: user.hourly_rate || 0,
  };
}

type SortOption = "rating" | "price-low" | "price-high" | "reviews";

export default function DJsPage() {
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const { data, isLoading } = useDiscoverDjsQuery({
    limit: 100,
    offset: 0,
    search: searchQuery || undefined,
    genre: activeGenre === "All Genres" ? undefined : activeGenre,
  });

  const djs = (data?.djs || []).map(mapUserToDjCard);

  const filteredDJs = djs
    .filter((dj) => {
      const matchesGenre =
        activeGenre === "All Genres" ||
        dj.genres.some((g) =>
          g.toLowerCase().includes(activeGenre.toLowerCase())
        );
      const matchesSearch = dj.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPrice =
        dj.hourlyRate >= priceRange[0] && dj.hourlyRate <= priceRange[1];
      return matchesGenre && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.hourlyRate - b.hourlyRate;
      if (sortBy === "price-high") return b.hourlyRate - a.hourlyRate;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white">DJs</h1>
        <p className="mt-1 text-[#6b7280]">
          {isLoading
            ? "Loading DJs..."
            : `${djs.length} DJs available for booking`}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex h-11 w-full max-w-md items-center gap-2 rounded-xl border border-[#1e2536] bg-[#0d1117] px-4">
          <svg
            className="h-4 w-4 text-[#6b7280]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search DJs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#4b5563]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6b7280]">Price:</span>
            <select
              value={`${priceRange[0]}-${priceRange[1]}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split("-").map(Number);
                setPriceRange([min, max]);
              }}
              className="rounded-lg border border-[#1e2536] bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1]"
            >
              <option value="0-500">All Prices</option>
              <option value="0-100">Under $100</option>
              <option value="100-150">$100 - $150</option>
              <option value="150-200">$150 - $200</option>
              <option value="200-500">$200+</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6b7280]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-[#1e2536] bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1]"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <GenreTabs
        genres={genres}
        activeGenre={activeGenre}
        onGenreChange={setActiveGenre}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6b7280]">
          Showing {filteredDJs.length} of {djs.length} DJs
        </p>
      </div>

      {!isLoading && filteredDJs.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDJs.map((dj) => (
            <DJCard key={dj.id} dj={dj} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e2536] bg-[#0d1117] py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e2536]">
            <svg
              className="h-8 w-8 text-[#6b7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">
            {isLoading ? "Loading DJs..." : "No DJs found"}
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">
            {isLoading
              ? "Fetching available DJs for booking."
              : "Try adjusting your filters or search query"}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveGenre("All Genres");
              setSearchQuery("");
              setPriceRange([0, 500]);
            }}
            className="mt-4 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5558e3]"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
