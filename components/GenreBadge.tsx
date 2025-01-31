'use client';

import React from 'react';
import { GENRES } from '@/constants/genres';

// We'll define a small interface for the props
interface GenreBadgeProps {
  genre: string;
}

export function GenreBadge({ genre }: GenreBadgeProps) {
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
}
