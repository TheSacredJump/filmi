'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Film, Plus, Users, X, LogOut, Ban, Check } from 'lucide-react';
import { InvitationsList } from '@/components/InvitationsList';

interface MovieSpace {
  id: string;
  name: string;
  description: string;
  created_at: string;
  owner_id: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<MovieSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);

  // Fetch user's movie spaces
  async function fetchSpaces() {
    setLoading(true);
  
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }
  
    // 1) Fetch the spaces the user owns:
    const { data: ownedSpaces, error: ownedError } = await supabase
      .from('movie_spaces')
      .select('*')
      .eq('owner_id', session.user.id);
  
    if (ownedError) {
      console.error('Error fetching owned spaces:', ownedError);
      setLoading(false);
      return;
    }
  
    // 2) Find which spaces the user is a member of:
    const { data: memberships, error: membershipError } = await supabase
      .from('movie_space_members')
      .select('space_id')
      .eq('user_id', session.user.id);
  
    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      setLoading(false);
      return;
    }
  
    // If the user has no memberships, we can just show owned
    if (!memberships || memberships.length === 0) {
      setSpaces(ownedSpaces || []);
      setLoading(false);
      return;
    }
  
    // 3) From the membership rows, gather space_ids:
    const spaceIds = memberships.map((m) => m.space_id);
  
    // 4) Fetch those spaces (where the user is a member):
    const { data: joinedSpaces, error: joinedError } = await supabase
      .from('movie_spaces')
      .select('*')
      .in('id', spaceIds);
  
    if (joinedError) {
      console.error('Error fetching joined spaces:', joinedError);
      setLoading(false);
      return;
    }
  
    // 5) Combine owned + joined
    let allSpaces = [...(ownedSpaces || []), ...(joinedSpaces || [])];
  
    // Optional: remove duplicates if user is both owner & member
    const uniqueMap = new Map();
    for (const s of allSpaces) {
      uniqueMap.set(s.id, s);
    }
    allSpaces = [...uniqueMap.values()];
  
    // 6) Update state
    setSpaces(allSpaces);
    setLoading(false);
  }
  


  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      const { data: space, error: createError } = await supabase
        .from('movie_spaces')
        .insert([
          {
            name: newSpace.name,
            description: newSpace.description,
            owner_id: session.user.id,
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      // Add owner as a member
      const { error: memberError } = await supabase
        .from('movie_space_members')
        .insert([
          {
            space_id: space.id,
            user_id: session.user.id,
            role: 'owner',
          }
        ]);

      if (memberError) throw memberError;

      setSpaces([...spaces, space]);
      setIsCreateModalOpen(false);
      setNewSpace({ name: '', description: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []); // Remove router from dependencies

  return (
    <div className="min-h-screen bg-neutral-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Your Movie Spaces</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Space
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-neutral-400">Loading your spaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 rounded-lg border border-neutral-800">
            <Film className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Movie Spaces Yet</h3>
            <p className="text-neutral-400 mb-6">Create your first movie space to start tracking films with friends!</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Your First Space
            </button>
            <InvitationsList />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div
                key={space.id}
                onClick={() => router.push(`/space/${space.id}`)}
                className="bg-gradient-to-br from-indigo-950 via-purple-500 to-indigo-950 rounded-lg border border-neutral-800 p-6 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <h3 className="text-xl font-medium text-white mb-2">{space.name}</h3>
                <p className="text-neutral-400 mb-4 line-clamp-2">{space.description}</p>
                <div className="flex items-center text-neutral-800">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{space.member_count} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Space Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Create Movie Space</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Space Name
                </label>
                <input
                  type="text"
                  value={newSpace.name}
                  onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Movie Night Club"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Description
                </label>
                <textarea
                  value={newSpace.description}
                  onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 h-24"
                  placeholder="What's this space about?"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
    </div>
  );
}