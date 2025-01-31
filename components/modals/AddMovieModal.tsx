'use client';

import React, { FormEvent } from 'react';
import { X, Film } from 'lucide-react';
import { GENRES } from '@/constants/genres';

interface NewMovieState {
  title: string;
  genre: string;
  lead_actors: string; // comma-separated string
  status: 'watched' | 'wishlist';
  posterFile: File | null;
}

interface AddMovieModalProps {
  isOpen: boolean;
  error?: string;
  newMovie: NewMovieState;
  onClose: () => void;
  onChange: (updated: Partial<NewMovieState>) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AddMovieModal({
  isOpen,
  error,
  newMovie,
  onClose,
  onChange,
  onSubmit,
}: AddMovieModalProps) {
  if (!isOpen) return null;

  // Helper for handling file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange({ posterFile: e.target.files[0] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Add Movie</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">
              Movie Title
            </label>
            <input
              type="text"
              value={newMovie.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">
              Genre
            </label>
            <select
              value={newMovie.genre}
              onChange={(e) => onChange({ genre: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a genre</option>
              {GENRES.map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">
              Lead Actors (comma-separated)
            </label>
            <input
              type="text"
              value={newMovie.lead_actors}
              onChange={(e) => onChange({ lead_actors: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g., Tom Hanks, Morgan Freeman"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">
              Movie Poster
            </label>
            <div className="flex gap-4 items-start">
              {newMovie.posterFile ? (
                <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden group">
                  <img
                    src={URL.createObjectURL(newMovie.posterFile)}
                    alt="Selected poster"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ posterFile: null })}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-32 aspect-[2/3] bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Film className="w-8 h-8 text-neutral-700" />
                </div>
              )}
              <div className="flex-1">
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white hover:border-purple-500 transition-colors cursor-pointer">
                    {newMovie.posterFile ? 'Change Poster' : 'Upload Poster'}
                  </div>
                </label>
                <p className="text-xs text-neutral-500 mt-2">
                  Recommended: 2:3 ratio, max 2MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">
              Status
            </label>
            <select
              value={newMovie.status}
              onChange={(e) =>
                onChange({ status: e.target.value as 'watched' | 'wishlist' })
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="watched">Watched</option>
              <option value="wishlist">Want to Watch</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Movie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
