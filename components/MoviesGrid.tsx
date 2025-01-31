'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Film } from 'lucide-react';
import { GenreBadge } from './GenreBadge';
import { StarRating } from '@/components/StarRating';

// The type definitions (Movie) can be imported from a shared types file or defined inline
interface Movie {
  id: string;
  title: string;
  genre: string;
  lead_actors: string[];
  image_url: string;
  status: 'watched' | 'wishlist';
  averageRating?: number;
  ratingCount?: number;
}

interface MoviesGridProps {
  spaceId: string;        // So we can redirect to /space/spaceId/movie/movieId
  movies: Movie[];
}

export function MoviesGrid({ spaceId, movies }: MoviesGridProps) {
  const router = useRouter();

  if (!movies || movies.length === 0) {
    return null; // can show a fallback in the parent if needed
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <div
          key={movie.id}
          onClick={() => router.push(`/space/${spaceId}/movie/${movie.id}`)}
          className="group bg-neutral-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
        >
          <div className="aspect-[2/3] relative">
            {movie.image_url ? (
              <img
                src={movie.image_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                <Film className="w-12 h-12 text-neutral-700" />
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-sm text-neutral-300 line-clamp-2 mb-2">
                {Array.isArray(movie.lead_actors) ? movie.lead_actors.join(', ') : ''}
              </p>
              {movie.status === 'wishlist' && (
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-full w-fit">
                  Wishlist
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">
              {movie.title}
            </h3>
            <GenreBadge genre={movie.genre} />
            {movie.ratingCount && movie.ratingCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating
                  // Safely handle averageRating
                  initialRating={Number(movie.averageRating?.toFixed(1) || 0)}
                  readonly
                  size="xs"
                />
                <span className="text-xs text-neutral-400">({movie.ratingCount})</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
