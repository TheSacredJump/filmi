'use client';

import React from 'react';
import { Film } from 'lucide-react';

interface MoviePosterProps {
  imageUrl?: string | null;
  title: string;
}

export function MoviePoster({ imageUrl, title }: MoviePosterProps) {
  return (
    <div className="w-full aspect-[2/3] bg-gradient-to-br from-purple-950 via-pink-500 to-purple-950 rounded-2xl flex items-center justify-center p-3">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full aspect-[2/3] object-cover rounded-lg"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-neutral-800 rounded-lg flex items-center justify-center">
          <Film className="w-16 h-16 text-neutral-700" />
        </div>
      )}
    </div>
  );
}
