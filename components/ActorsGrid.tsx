'use client';

import React from 'react';
import { Users, Star } from 'lucide-react';

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



// One approach: for each movie, store a list of rating rows or an average
interface ActorMovieRating {
  movie_id: string;
  movie_title: string;
  movie_image_url: string;
  // If you want the user’s rating, average rating, or rating count, include them:
  averageRating?: number;
  ratingCount?: number;
  // Or keep raw rating rows
  // ratings?: { user_id: string; rating: number }[];
}


interface ActorsGridProps {
  actors: Actor[];
  onActorSelect: (actor: Actor) => void;
}

export function ActorsGrid({ actors, onActorSelect }: ActorsGridProps) {
  if (!actors || actors.length === 0) {
    return null;
  }

  

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {actors.map((actor) => (
        <div
          key={actor.id || actor.name}
          onClick={() => onActorSelect(actor)}
          className="bg-neutral-900 rounded-lg p-4 hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
        >
          {/* Actor Image */}
          <div className="mb-4 w-full aspect-square overflow-hidden rounded-lg">
            {actor.image_url ? (
              <img
                src={actor.image_url}
                alt={actor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                <Users className="w-12 h-12 text-neutral-700" />
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">{actor.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-neutral-400">
              {actor.averageRating ? actor.averageRating.toFixed(1) : 'No ratings'}
            </span>
          </div>

          {/* Additional actor info can go here */}
        </div>
      ))}
    </div>
  );
}
