"use client";

import { cn } from "@/lib/utils";

interface GenreTabsProps {
  genres: string[];
  activeGenre: string;
  onGenreChange: (_genre: string) => void;
}

export function GenreTabs({
  genres,
  activeGenre,
  onGenreChange,
}: GenreTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const isActive = genre === activeGenre;

        return (
          <button
            key={genre}
            type="button"
            onClick={() => onGenreChange(genre)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "border-white/20 bg-white text-[#0d1117]"
                : "border-[#1e2536] bg-[#0d1117] text-[#9ca3af] hover:border-[#2d3548] hover:text-white"
            )}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
