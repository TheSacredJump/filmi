'use client';

import React from 'react';
import { StarRating } from '@/components/StarRating';

interface MovieRatingsProps {
  userRating: number;
  averageRating: number;
  ratingCount: number;
  onUserRatingChange: (newRating: number) => void;
}

export function MovieRatings({
  userRating,
  averageRating,
  ratingCount,
  onUserRatingChange,
}: MovieRatingsProps) {
  return (
    <div className="space-y-4 mt-6">
      {/* Your Rating */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Your Rating</h3>
        <StarRating
          initialRating={userRating}
          onChange={onUserRatingChange}
          size="lg"
        />
      </div>

      {/* Average Rating */}
      {ratingCount > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-2">Average Rating</h3>
          <div className="flex items-center gap-3 mb-4">
            <StarRating initialRating={averageRating} readonly size="md" />
            <span className="text-sm text-neutral-400">
              ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
