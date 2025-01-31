'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { StarRating } from '@/components/StarRating';

interface ActorRatingCarouselProps {
  leadActors: string[];
  currentActorIndex: number;
  onPrevActor: () => void;
  onNextActor: () => void;
  actorRatings: { [key: string]: number };       // user’s rating for each actor
  averageActorRatings: { [key: string]: number };// average rating per actor
  actorRatingCounts: { [key: string]: number };  // rating count per actor
  onActorRatingChange: (actorName: string, newRating: number) => void;
  setCurrentActorIndex: (index: number) => void;
}

export function ActorRatingCarousel({
  leadActors,
  currentActorIndex,
  onPrevActor,
  onNextActor,
  actorRatings,
  averageActorRatings,
  actorRatingCounts,
  onActorRatingChange,
  setCurrentActorIndex,
}: ActorRatingCarouselProps) {
  // If there are no actors, return nothing
  if (!leadActors || leadActors.length === 0) return null;

  const currentActorName = leadActors[currentActorIndex];
  const userActorRating = actorRatings[currentActorName] || 0;
  const avgActorRating = averageActorRatings[currentActorName] || 0;
  const actorCount = actorRatingCounts[currentActorName] || 0;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Actor Ratings</h2>
      <div className="relative bg-neutral-900 rounded-lg p-6">
        {/* Navigation Arrows */}
        {currentActorIndex > 0 && (
          <button
            onClick={onPrevActor}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-800 hover:bg-neutral-700 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </button>
        )}
        {currentActorIndex < leadActors.length - 1 && (
          <button
            onClick={onNextActor}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-800 hover:bg-neutral-700 p-2 rounded-full transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-neutral-400" />
          </button>
        )}

        {/* Actor Rating Card */}
        <div className="flex flex-col items-center text-center px-12">
          <h3 className="text-2xl font-medium text-white mb-4">
            {currentActorName}
          </h3>
          <div className="space-y-4">
            <StarRating
              initialRating={userActorRating}
              onChange={(rating) => onActorRatingChange(currentActorName, rating)}
              size="lg"
            />
            {actorCount > 0 && (
              <div className="flex flex-col items-center gap-1">
                <span 
                  className="inline-block text-right text-lg text-white font-medium"
                  style={{ width: '3ch' }}
                >
                  {avgActorRating.toFixed(1)}
                </span>
                <span className="text-sm text-neutral-400">
                  {actorCount} rating{actorCount === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {leadActors.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentActorIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentActorIndex
                  ? 'bg-purple-500'
                  : 'bg-neutral-700 hover:bg-neutral-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
