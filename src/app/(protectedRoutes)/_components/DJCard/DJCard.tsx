import Image from "next/image";
import Link from "next/link";

export interface DJ {
  id: string;
  name: string;
  avatar?: string;
  genres: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
}

interface DJCardProps {
  dj: DJ;
}

export function DJCard({ dj }: DJCardProps) {
  const initials = dj.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="group rounded-2xl border border-[#1e2536] bg-[#0d1117] p-5 transition-all hover:border-[#2d3548]">
      <div className="mb-4 flex justify-center">
        {dj.avatar ? (
          <Image
            src={dj.avatar}
            alt={dj.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-[#1e2536]"
            unoptimized
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xl font-bold text-white ring-2 ring-[#1e2536]">
            {initials}
          </div>
        )}
      </div>

      <Link
        href={`/djs/${dj.id}`}
        className="block text-center text-lg font-semibold text-white transition hover:text-[#a78bfa]"
      >
        {dj.name}
      </Link>

      <p className="mt-1 text-center text-sm text-[#6b7280]">
        {dj.genres.join(" • ")}
      </p>

      <div className="mt-3 flex items-center justify-center gap-1 text-[#fbbf24]">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm font-medium">{dj.rating}</span>
        <span className="text-sm text-[#6b7280]">({dj.reviewCount} reviews)</span>
      </div>

      <p className="mt-3 text-center text-lg font-semibold text-white">
        ${dj.hourlyRate}{" "}
        <span className="text-sm font-normal text-[#6b7280]">/ hour</span>
      </p>

      <Link
        href={`/djs/${dj.id}/book`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e2536] bg-[#0d1117] py-2.5 text-sm font-medium text-white transition-all hover:border-[#6366f1] hover:bg-[#6366f1]/10"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Book Event
      </Link>
    </article>
  );
}
