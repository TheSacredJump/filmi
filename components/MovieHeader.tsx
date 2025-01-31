'use client';

import React from 'react';
import { GENRES } from '@/constants/genres';

interface MovieHeaderProps {
  title: string;
  genre: string;
  status: 'watched' | 'wishlist';
}

const GenreBadge = ({ genre }: { genre: string }) => {
  const genreInfo =
    GENRES.find((g) => g.value === genre?.toLowerCase()) || {
      label: genre || 'Unknown',
      style: {
        backgroundColor: 'rgba(107, 114, 128, 0.2)',
        color: 'rgb(209, 213, 219)',
      },
    };

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={genreInfo.style}
    >
      {genreInfo.label}
    </span>
  );
};

export function MovieHeader({ title, genre, status }: MovieHeaderProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <div className="flex items-center gap-3 text-neutral-400 mb-6">
        <GenreBadge genre={genre} />
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === 'watched'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-purple-500/20 text-purple-400'
          }`}
        >
          {status === 'watched' ? 'Watched' : 'Wishlist'}
        </span>
      </div>
    </div>
  );
}
