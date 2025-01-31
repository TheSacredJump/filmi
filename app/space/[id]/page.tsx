'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { MoviesGrid } from '@/components/MoviesGrid';
import { ActorsGrid } from '@/components/ActorsGrid';
import { AddMovieModal } from '@/components/modals/AddMovieModal';
import { AddActorModal } from '@/components/modals/AddActorModal';
import { ActorDetailsModal } from '@/components/modals/ActorDetailsModal';
import { Plus } from 'lucide-react';
import { InviteMembersModal } from '@/components/modals/InviteMembersModal';

interface Space {
  id: string;
  name: string;
  description: string;
  owner_id: string;
}

interface Movie {
  id: string;
  title: string;
  genre: string;
  lead_actors: string[];
  image_url: string;
  status: 'watched' | 'wishlist';
  created_at: string;
  added_by: { username: string };
  averageRating?: number;
  ratingCount?: number;
}

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


export default function SpacePage() {
  const router = useRouter();
  const { id } = useParams();

  const [space, setSpace] = useState<Space | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);

  // Tab and search
  const [activeTab, setActiveTab] = useState<'watched' | 'wishlist' | 'actors'>('watched');
  const [searchQuery, setSearchQuery] = useState('');
  const [actorSearchQuery, setActorSearchQuery] = useState('');

  // Add Movie modal
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [newMovie, setNewMovie] = useState<{
    title: string;
    genre: string;
    lead_actors: string; // store as comma-separated for the form
    status: 'watched' | 'wishlist';
    posterFile: File | null;
  }>({
    title: '',
    genre: '',
    lead_actors: '',
    status: 'watched',
    posterFile: null,
  });

  // Add Actor modal
  const [isAddActorOpen, setIsAddActorOpen] = useState(false);
  const [newActor, setNewActor] = useState<{
    name: string;
    imageFile: File | null;
  }>({
    name: '',
    imageFile: null,
  });

  // Actor details modal
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchSpaceDetails();
    fetchMovies();
  }, [id]);

  // If tab changes to "actors", fetch them
  useEffect(() => {
    if (activeTab === 'actors' && id) {
      extractAndProcessActors();
    }
  }, [activeTab, id, actorSearchQuery]);

  // ------------------------------
  // Data Fetching
  // ------------------------------

  async function fetchSpaceDetails() {
    try {
      const { data: spaceData, error } = await supabase
        .from('movie_spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSpace(spaceData);
    } catch (err) {
      console.error('Error fetching space details:', err);
    }
  }

  async function fetchMovies() {
    try {
      const { data: moviesData, error } = await supabase
        .from('movies')
        .select(`*, movie_ratings ( rating )`)
        .eq('space_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate average ratings with rounding to nearest 0.5
      const moviesWithRatings = moviesData?.map((movie: any) => {
        const ratings = movie.movie_ratings || [];
        let averageRating = 0;

        if (ratings.length > 0) {
          const sum = ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0);
          const avg = sum / ratings.length;
          averageRating = Math.round(avg * 2) / 2; // nearest 0.5
        }

        return {
          ...movie,
          averageRating,
          ratingCount: ratings.length,
        };
      }) || [];

      setMovies(moviesWithRatings);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  }

  async function extractAndProcessActors() {
    try {
      if (!id) return;
  
      // 1. Fetch the base list of actors from the database for this space
      const { data: dbActors, error: actorsError } = await supabase
        .from('actors')
        .select('*')
        .eq('space_id', id)
        .ilike('name', `%${actorSearchQuery}%`);
  
      if (actorsError) throw actorsError;
  
      // 2. Also fetch all actor_ratings for actors in this space.
      //    We might not have "space_id" in actor_ratings, so we can
      //    either fetch *all* and filter, or do an `IN` query for actor names, etc.
      //    If you store space_id on actor_ratings, do `eq('space_id', id)`.
      const actorNames = dbActors.map((actor) => actor.name);
      const { data: allRatings, error: ratingsError } = await supabase
        .from('actor_ratings')
        .select('actor_name, rating')
        .in('actor_name', actorNames); 
  
      if (ratingsError) throw ratingsError;
  
      // 3. Build a map that accumulates total rating and count per actor_name
      type RatingAccumulator = {
        totalRating: number;
        count: number;
      };
      const ratingsMap: Record<string, RatingAccumulator> = {};
  
      allRatings?.forEach((row) => {
        const { actor_name, rating } = row;
        if (!ratingsMap[actor_name]) {
          ratingsMap[actor_name] = { totalRating: 0, count: 0 };
        }
        ratingsMap[actor_name].totalRating += rating;
        ratingsMap[actor_name].count += 1;
      });
  
      // 4. For each actor in dbActors, compute average rating from the map
      const processedActors = dbActors.map((actor) => {
        const acc = ratingsMap[actor.name];
        let averageRating = 0;
        let ratingCount = 0;
  
        if (acc) {
          averageRating = acc.totalRating / acc.count;
          // Round to nearest 0.5 if you like
          averageRating = Math.round(averageRating * 2) / 2;
          ratingCount = acc.count;
        }
  
        return {
          ...actor,
          averageRating,
          ratingCount,
        };
      });
  
      // 5. Optionally sort them if you like
      const sortedActors = processedActors.sort((a, b) => a.name.localeCompare(b.name));
  
      // 6. Set them in state
      setActors(sortedActors);
  
    } catch (err) {
      console.error('Error fetching actors:', err);
    }
  }
  

  // ------------------------------
  // Handlers - Add Movie
  // ------------------------------

  const handleOpenAddMovie = () => {
    setNewMovie({
      title: '',
      genre: '',
      lead_actors: '',
      status: 'watched',
      posterFile: null,
    });
    setError('');
    setIsAddMovieOpen(true);
  };

  const handleAddMovieChange = (updated: Partial<typeof newMovie>) => {
    setNewMovie((prev) => ({ ...prev, ...updated }));
  };

  const handleAddMovieSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      let posterUrl: string | null = null;

      // Upload image if one was selected
      if (newMovie.posterFile) {
        const fileExt = newMovie.posterFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('movie_posters')
          .upload(filePath, newMovie.posterFile);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded image
        const {
          data: { publicUrl },
        } = supabase.storage.from('movie_posters').getPublicUrl(filePath);

        posterUrl = publicUrl;
      }

      // Insert movie
      const { error: insertError } = await supabase.from('movies').insert([
        {
          space_id: id,
          title: newMovie.title,
          genre: newMovie.genre,
          lead_actors: newMovie.lead_actors
            .split(',')
            .map((actor) => actor.trim()),
          image_url: posterUrl,
          status: newMovie.status,
          added_by: session.user.id,
        },
      ]);

      if (insertError) throw insertError;

      setIsAddMovieOpen(false);
      // reset fields
      setNewMovie({
        title: '',
        genre: '',
        lead_actors: '',
        status: 'watched',
        posterFile: null,
      });

      fetchMovies();
    } catch (err) {
      console.error('Error adding movie:', err);
      setError('Failed to add movie');
    }
  };

  async function handleActorSelect(actor: Actor) {
    try {
      // 1. Query actor_ratings, joining with movies table
      // actor.name is the unique actor name
      const { data: ratingRows, error } = await supabase
        .from('actor_ratings')
        .select(`
          rating,
          movie_id,
          user_id,
          movies:movie_id (
            id,
            title,
            image_url
          )
        `)
        .eq('actor_name', actor.name)  // filter by this actor’s name
        .eq('movies.space_id', space?.id); // filter by this space
  
      if (error) throw error;
  
      // ratingRows is an array. Example row:
      // {
      //   rating: number,
      //   movie_id: string,
      //   user_id: string,
      //   movies: {
      //     id: string,
      //     title: string,
      //     image_url: string,
      //   }
      // }
  
      // 2. Group rows by movie_id to compute an average rating
      const groupedByMovie: Record<string, {
        movie_id: string;
        movie_title: string;
        movie_image_url: string | null;
        totalRating: number;
        count: number;
      }> = {};
  
      ratingRows?.forEach((row) => {
        const m = row.movies; // from the join
        if (!m) return;       // just a safety check
        if (!groupedByMovie[m.id]) {
          groupedByMovie[m.id] = {
            movie_id: m.id,
            movie_title: m.title,
            movie_image_url: m.image_url,
            totalRating: 0,
            count: 0,
          };
        }
        groupedByMovie[m.id].totalRating += row.rating;
        groupedByMovie[m.id].count += 1;
      });
  
      // 3. Convert that grouped object into an array
      const actorMovieRatings = Object.values(groupedByMovie).map((item) => ({
        movie_id: item.movie_id,
        movie_title: item.movie_title,
        movie_image_url: item.movie_image_url,
        averageRating: item.count > 0
          ? Math.round((item.totalRating / item.count) * 2) / 2
          : 0,
        ratingCount: item.count,
      }));
  
      // 4. Create a new actor object with the aggregated data
      const updatedActor: Actor = {
        ...actor,
        actorMovieRatings,
      };
  
      // 5. Finally store it in state so your modal can show it
      setSelectedActor(updatedActor);
    } catch (err) {
      console.error('Error fetching actor ratings:', err);
    }
  }
  

  // ------------------------------
  // Handlers - Add Actor
  // ------------------------------

  const handleOpenAddActor = () => {
    setNewActor({
      name: '',
      imageFile: null,
    });
    setError('');
    setIsAddActorOpen(true);
  };

  const handleAddActorChange = (updated: Partial<typeof newActor>) => {
    setNewActor((prev) => ({ ...prev, ...updated }));
  };

  const handleAddActorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      let imageUrl: string | null = null;

      // Upload image if one was selected
      if (newActor.imageFile) {
        const fileExt = newActor.imageFile.name.split('.').pop();
        const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
        const filePath = `actors/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('actor_images')
          .upload(filePath, newActor.imageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('actor_images').getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Insert actor
      const { data: actorData, error: insertError } = await supabase
        .from('actors')
        .insert([
          {
            space_id: id,
            name: newActor.name,
            image_url: imageUrl,
            added_by: session.user.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      setIsAddActorOpen(false);
      // reset
      setNewActor({
        name: '',
        imageFile: null,
      });

      extractAndProcessActors();
    } catch (err) {
      console.error('Error adding actor:', err);
      setError('Failed to add actor');
    }
  };

  // ------------------------------
  // Filtering logic
  // ------------------------------
  const filteredMovies = movies.filter((movie) => {
    const matchesStatus = movie.status === activeTab;
    const lowerSearch = searchQuery.toLowerCase();

    const matchesSearch =
      movie.title.toLowerCase().includes(lowerSearch) ||
      movie.genre.toLowerCase().includes(lowerSearch) ||
      (Array.isArray(movie.lead_actors) &&
        movie.lead_actors.some((actor) =>
          actor.toLowerCase().includes(lowerSearch)
        ));

    return matchesStatus && matchesSearch;
  });

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <Sidebar
        spaceName={space?.name}
        spaceDescription={space?.description}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main content */}
      <div className="flex-1 ml-64 p-8">
        {activeTab === 'actors' ? (
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Actors</h2>

              {/* Search Bar for Actors */}
              <div className="relative w-[50%] flex items-center gap-4">
                <input
                  type="text"
                  value={actorSearchQuery}
                  onChange={(e) => setActorSearchQuery(e.target.value)}
                  placeholder="Search actors by name..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <button
                  onClick={handleOpenAddActor}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <h1 className="inline-block">Add Actor</h1>
                </button>
                <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Invite Members
            </button>
              </div>
            </div>

            {/* ActorsGrid (Filtered if you want, or just pass the entire list) */}
            {actors.length > 0 ? (
              <ActorsGrid
                actors={
                  actorSearchQuery
                    ? actors.filter((actor) =>
                        actor.name
                          .toLowerCase()
                          .includes(actorSearchQuery.toLowerCase())
                      )
                    : actors
                }
                onActorSelect={handleActorSelect}
              />
            ) : (
              <div className="text-center py-12 bg-neutral-900 rounded-lg border border-neutral-800">
                <h3 className="text-xl font-medium text-white mb-2">
                  {actorSearchQuery ? 'No actors found' : 'No actors yet'}
                </h3>
                <p className="text-neutral-400 mb-6">
                  {actorSearchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add some actors to get started!'}
                </p>
                <button
                  onClick={handleOpenAddActor}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors mx-auto"
                >
                  + Add Your First Actor
                </button>
              </div>
            )}
          </div>
        ) : (
          // Movies Tab (watched or wishlist)
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold capitalize">
                {activeTab === 'watched' ? 'Movies Watched' : 'Movie Wishlist'}
              </h2>

              {/* Search bar */}
              <div className="relative w-[50%]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies by title, genre, or actors..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <button
                onClick={handleOpenAddMovie}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                + Add Movie
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="text-center py-12 bg-neutral-900 rounded-lg border border-neutral-800">
                <h3 className="text-xl font-medium text-white mb-2">
                  {searchQuery
                    ? 'No movies found'
                    : activeTab === 'watched'
                    ? 'No Movies Watched Yet'
                    : 'Wishlist is Empty'}
                </h3>
                <p className="text-neutral-400 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : activeTab === 'watched'
                    ? "Start adding movies you've watched together!"
                    : 'Add movies you want to watch with your friends!'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleOpenAddMovie}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors mx-auto"
                  >
                    + Add Your First Movie
                  </button>
                )}
              </div>
            ) : (
              <MoviesGrid spaceId={id} movies={filteredMovies} />
            )}
          </div>
        )}
      </div>

      {/* Add Movie Modal */}
      <AddMovieModal
        isOpen={isAddMovieOpen}
        error={error}
        newMovie={newMovie}
        onClose={() => setIsAddMovieOpen(false)}
        onChange={handleAddMovieChange}
        onSubmit={handleAddMovieSubmit}
      />

      {/* Add Actor Modal */}
      <AddActorModal
        isOpen={isAddActorOpen}
        error={error}
        newActor={newActor}
        onClose={() => setIsAddActorOpen(false)}
        onChange={handleAddActorChange}
        onSubmit={handleAddActorSubmit}
      />

      {/* Actor Details Modal */}
      <ActorDetailsModal
        actor={selectedActor}
        spaceId={id}
        onClose={() => setSelectedActor(null)}
      />
      
      <InviteMembersModal
        spaceId={id}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
