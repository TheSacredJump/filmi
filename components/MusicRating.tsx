'use client';

import React from 'react';
import { StarRating } from '@/components/StarRating';

interface MusicRatingProps {
  musicRating: number;
  onMusicRatingChange: (newRating: number) => void;
  musicRatingCount: number;
  averageMusicRating: number;
}

export function MusicRating({
  musicRating,
  onMusicRatingChange,
  musicRatingCount,
  averageMusicRating,
}: MusicRatingProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Music Rating</h2>
      <div className="space-y-4">
        <div>
          <StarRating
            initialRating={musicRating}
            onChange={onMusicRatingChange}
            size="md"
          />
        </div>
        {musicRatingCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">
              Average: {averageMusicRating.toFixed(1)} ({musicRatingCount} ratings)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
