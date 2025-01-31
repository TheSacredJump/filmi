'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

import { MoviePoster } from '@/components/MoviePoster';
import { MovieHeader } from '@/components/MovieHeader';
import { MovieRatings } from '@/components/MovieRatings';
import { ActorRatingCarousel } from '@/components/ActorRatingsCarousel';
import { MusicRating } from '@/components/MusicRating';
import { MovieMetadata } from '@/components/MovieMetadata';

interface Movie {
  id: string;
  title: string;
  genre: string;
  lead_actors: string[];
  image_url: string;
  status: 'watched' | 'wishlist';
  created_at: string;
  added_by: string;
  user: {
    username: string;
  };
}

export default function MovieDetailPage() {
  const router = useRouter();
  const { id, movieId } = useParams();

  // Movie main state
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Ratings
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  // Actor Ratings
  const [actorRatings, setActorRatings] = useState<{ [key: string]: number }>({});
  const [averageActorRatings, setAverageActorRatings] = useState<{ [key: string]: number }>({});
  const [actorRatingCounts, setActorRatingCounts] = useState<{ [key: string]: number }>({});
  const [currentActorIndex, setCurrentActorIndex] = useState(0);

  // Music Rating
  const [musicRating, setMusicRating] = useState<number>(0);
  const [averageMusicRating, setAverageMusicRating] = useState<number>(0);
  const [musicRatingCount, setMusicRatingCount] = useState<number>(0);

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
      fetchRatings();
    }
  }, [movieId]);

  // ---------------------------
  // Data Fetching
  // ---------------------------

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      // Get movie details with user profile info
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select(`*, user:added_by(username)`)
        .eq('id', movieId)
        .single();

      if (movieError) throw movieError;

      // Get user's rating
      const { data: userRatingData } = await supabase
        .from('movie_ratings')
        .select('rating')
        .eq('movie_id', movieId)
        .eq('user_id', session.user.id)
        .single();

      // Get all ratings for average
      const { data: ratings, error: ratingsError } = await supabase
        .from('movie_ratings')
        .select('rating')
        .eq('movie_id', movieId);

      if (ratingsError) throw ratingsError;

      // Calculate average
      let avgRating = 0;
      if (ratings && ratings.length > 0) {
        avgRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
        avgRating = Math.round(avgRating * 2) / 2;
      }

      setMovie(movieData);
      setUserRating(userRatingData?.rating || 0);
      setAverageRating(avgRating);
      setRatingCount(ratings?.length || 0);
    } catch (err) {
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    // ---------------------------
    // Actor Ratings
    // ---------------------------
    // Fetch user's actor ratings
    const { data: userActorRatings } = await supabase
      .from('actor_ratings')
      .select('actor_name, rating')
      .eq('movie_id', movieId)
      .eq('user_id', session.user.id);

    // Fetch all actor ratings for averages
    const { data: allActorRatings } = await supabase
      .from('actor_ratings')
      .select('actor_name, rating')
      .eq('movie_id', movieId);

    const userRatings: { [key: string]: number } = {};
    const avgRatings: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};

    userActorRatings?.forEach((rating) => {
      userRatings[rating.actor_name] = rating.rating;
    });

    allActorRatings?.forEach((rating) => {
      if (!avgRatings[rating.actor_name]) {
        avgRatings[rating.actor_name] = 0;
        counts[rating.actor_name] = 0;
      }
      avgRatings[rating.actor_name] += rating.rating;
      counts[rating.actor_name]++;
    });

    Object.keys(avgRatings).forEach((actor) => {
      avgRatings[actor] = Math.round((avgRatings[actor] / counts[actor]) * 2) / 2;
    });

    setActorRatings(userRatings);
    setAverageActorRatings(avgRatings);
    setActorRatingCounts(counts);

    // ---------------------------
    // Music Ratings
    // ---------------------------
    // Fetch user's music rating
    const { data: userMusicRating } = await supabase
      .from('music_ratings')
      .select('rating')
      .eq('movie_id', movieId)
      .eq('user_id', session.user.id)
      .single();

    // Fetch all music ratings for average
    const { data: allMusicRatings } = await supabase
      .from('music_ratings')
      .select('rating')
      .eq('movie_id', movieId);

    setMusicRating(userMusicRating?.rating || 0);

    if (allMusicRatings && allMusicRatings.length > 0) {
      const avg =
        allMusicRatings.reduce((acc, curr) => acc + curr.rating, 0) / allMusicRatings.length;
      const roundedAvg = Math.round(avg * 2) / 2;
      setAverageMusicRating(roundedAvg);
      setMusicRatingCount(allMusicRatings.length);
    }
  };

  // ---------------------------
  // Handler Functions
  // ---------------------------

  // When user changes their movie rating
  const handleRatingChange = async (newRating: number) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('movie_ratings').upsert(
        {
          movie_id: movieId,
          user_id: session.user.id,
          rating: newRating,
        },
        {
          onConflict: 'movie_id,user_id',
        }
      );

      if (error) throw error;
      // Refresh all movie details to get updated ratings
      fetchMovieDetails();
    } catch (err) {
      console.error('Error updating rating:', err);
    }
  };

  // When user changes an actor rating
  const handleActorRatingChange = async (actorName: string, newRating: number) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('actor_ratings').upsert(
        {
          movie_id: movieId,
          user_id: session.user.id,
          actor_name: actorName,
          rating: newRating,
        },
        {
          onConflict: 'movie_id,user_id,actor_name',
        }
      );

      if (error) throw error;
      fetchRatings();
    } catch (err) {
      console.error('Error updating actor rating:', err);
    }
  };

  // When user changes the music rating
  const handleMusicRatingChange = async (newRating: number) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('music_ratings').upsert(
        {
          movie_id: movieId,
          user_id: session.user.id,
          rating: newRating,
        },
        {
          onConflict: 'movie_id,user_id',
        }
      );

      if (error) throw error;
      fetchRatings();
    } catch (err) {
      console.error('Error updating music rating:', err);
    }
  };

  // Carousel navigation
  const nextActor = () => {
    if (movie?.lead_actors && currentActorIndex < movie.lead_actors.length - 1) {
      setCurrentActorIndex((prev) => prev + 1);
    }
  };

  const previousActor = () => {
    if (currentActorIndex > 0) {
      setCurrentActorIndex((prev) => prev - 1);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white h-full mb-10">
      {/* Header/Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push(`/space/${id}`)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Movies
        </button>
      </div>

      {/* Movie Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-1/3">
            <MoviePoster imageUrl={movie.image_url} title={movie.title} />
          </div>

          {/* Details */}
          <div className="flex-1">
            <MovieHeader title={movie.title} genre={movie.genre} status={movie.status} />

            <MovieRatings
              userRating={userRating}
              averageRating={averageRating}
              ratingCount={ratingCount}
              onUserRatingChange={handleRatingChange}
            />

            {/* Actor Carousel */}
            {movie.lead_actors?.length > 0 && (
              <ActorRatingCarousel
                leadActors={movie.lead_actors}
                currentActorIndex={currentActorIndex}
                onPrevActor={previousActor}
                onNextActor={nextActor}
                actorRatings={actorRatings}
                averageActorRatings={averageActorRatings}
                actorRatingCounts={actorRatingCounts}
                onActorRatingChange={handleActorRatingChange}
                setCurrentActorIndex={setCurrentActorIndex}
              />
            )}

            {/* Music Rating */}
            <MusicRating
              musicRating={musicRating}
              onMusicRatingChange={handleMusicRatingChange}
              averageMusicRating={averageMusicRating}
              musicRatingCount={musicRatingCount}
            />

            {/* Metadata */}
            <MovieMetadata
              addedBy={movie.user?.username}
              createdAt={movie.created_at}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
