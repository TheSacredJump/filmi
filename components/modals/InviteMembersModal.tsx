'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';

interface InviteMembersModalProps {
  spaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMembersModal({
  spaceId,
  isOpen,
  onClose,
}: InviteMembersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 1. Search 'profiles' by name
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      // e.g. if your 'profiles' table has fields: id, name, email
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email')
        .ilike('username', `%${searchTerm}%`);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Invite a user by ID
  const handleInvite = async (userId: string) => {
    try {
      setLoading(true);
      setError('');

      // Insert into movie_space_invites
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { error: inviteError } = await supabase
        .from('movie_space_invites')
        .insert({
          space_id: spaceId,
          invited_user_id: userId,
          invited_by: session.user.id,
          status: 'pending',
          role: 'member', // or 'admin' if you have more roles
        });

      if (inviteError) throw inviteError;

      // You could remove them from searchResults or show a success message
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Invite Members</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search form */}
        <div className="space-y-2 mb-4">
          <label className="block text-sm font-medium text-neutral-300">
            Search by Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter a name to search"
            />
            <button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        {/* Search Results */}
        {searchResults.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between bg-neutral-800 rounded-lg p-2 mb-2"
          >
            <div>
              <p className="text-white">{profile.name}</p>
              <p className="text-sm text-neutral-400">{profile.email}</p>
            </div>
            <button
              onClick={() => handleInvite(profile.id)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg"
              disabled={loading}
            >
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
