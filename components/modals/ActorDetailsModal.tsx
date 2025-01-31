'use client';

import React from 'react';
import { X, Users, Film, Star } from 'lucide-react';

interface Actor {
  id?: string;
  name: string;
  image_url?: string;
  actorMovieRatings?: ActorMovieRating[];
  averageRating?: number; // We'll fill this in
  ratingCount?: number;
}


interface ActorMovieRating {
  movie_id: string;
  movie_title: string;
  movie_image_url: string | null;
  averageRating?: number;
  ratingCount?: number;
}


interface ActorDetailsModalProps {
  actor: Actor | null;
  spaceId: string;            // if you need it for navigation
  onClose: () => void;
}

export function ActorDetailsModal({
  actor,
  spaceId,
  onClose
}: ActorDetailsModalProps) {
  if (!actor) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{actor.name}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actor Image */}
        <div className="flex items-start gap-6 mb-6">
          <div className="w-1/3">
            {actor.image_url ? (
              <img
                src={actor.image_url}
                alt={actor.name}
                className="w-full aspect-[3/4] object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-neutral-800 rounded-lg flex items-center justify-center">
                <Users className="w-16 h-16 text-neutral-700" />
              </div>
            )}
          </div>
          {/* You could put average rating or any other actor-level details here */}
        </div>

        {/* Now the Movie Ratings Section */}
        <h3 className="text-xl font-semibold mb-4">Ratings by Movie</h3>
        {(!actor.actorMovieRatings || actor.actorMovieRatings.length === 0) ? (
          <p className="text-neutral-400">No actor ratings found for {actor.name}.</p>
        ) : (
          <div className="space-y-4">
            {actor.actorMovieRatings.map((item) => (
              <div
                key={item.movie_id}
                className="flex items-center bg-neutral-800 rounded-lg p-4"
              >
                {/* Movie Poster or fallback */}
                {item.movie_image_url ? (
                  <img
                    src={item.movie_image_url}
                    alt={item.movie_title}
                    className="w-16 h-24 object-cover rounded-lg mr-4"
                  />
                ) : (
                  <div className="w-16 h-24 bg-neutral-700 rounded-lg mr-4 flex items-center justify-center">
                    <Film className="w-8 h-8 text-neutral-600" />
                  </div>
                )}

                {/* Movie Title and rating */}
                <div>
                  <h4 className="text-base font-medium">{item.movie_title}</h4>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-neutral-300">
                      {item.averageRating?.toFixed(1) ?? 0}
                    </span>
                    <span className="text-xs text-neutral-400 ml-2">
                      ({item.ratingCount} rating
                      {item.ratingCount === 1 ? '' : 's'})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
