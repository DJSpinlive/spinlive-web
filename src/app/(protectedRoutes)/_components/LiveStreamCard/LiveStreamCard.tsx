import Image from "next/image";
import Link from "next/link";

export interface LiveStream {
  id: string;
  title: string;
  djName: string;
  genre: string;
  viewers: number;
  rating: number;
  thumbnail: string;
}

interface LiveStreamCardProps {
  stream: LiveStream;
}

export function LiveStreamCard({ stream }: LiveStreamCardProps) {
  return (
    <Link
      href={`/live/${stream.id}`}
      className="group block overflow-hidden rounded-2xl border border-[#1e2536] bg-[#0d1117] transition-all hover:border-[#2d3548]"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={stream.thumbnail}
          alt={stream.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-[#ef4444] px-2 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white">
            Live
          </span>
        </span>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 backdrop-blur-sm">
          <svg
            className="h-3.5 w-3.5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs font-medium text-white">
            {stream.viewers.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-semibold text-white">
            {stream.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1 text-[#fbbf24]">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium">{stream.rating}</span>
          </div>
        </div>
        <p className="text-sm text-[#6b7280]">
          {stream.djName} • {stream.genre}
        </p>
      </div>
    </Link>
  );
}
