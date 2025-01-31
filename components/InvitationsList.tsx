'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SpaceInvite {
  id: string;
  space_id: string;
  status: string;
  role: string;
  movie_spaces: {
    name: string;
    id: string;
  };
}

export function InvitationsList() {
  const [invites, setInvites] = useState<SpaceInvite[]>([]);

  useEffect(() => {
    fetchInvites();
  }, []);

  async function fetchInvites() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Find invites for the current user
    const { data, error } = await supabase
      .from('movie_space_invites')
      .select(`
        id,
        space_id,
        status,
        role,
        movie_spaces (
          id,
          name
        )
      `)
      .eq('invited_user_id', session.user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching invites:', error);
      return;
    }

    setInvites(data || []);
  }

  async function handleAccept(invite: SpaceInvite) {
    try {
      // 1. Insert membership row
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error: membershipError } = await supabase
        .from('movie_space_members')
        .insert({
          space_id: invite.space_id,
          user_id: session.user.id,
          role: invite.role, // typically 'member'
        });
      if (membershipError) throw membershipError;

      // 2. Mark invite as accepted
      const { error: updateError } = await supabase
        .from('movie_space_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);
      if (updateError) throw updateError;

      // 3. Remove from local state
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (err) {
      console.error('Error accepting invite:', err);
    }
  }

  async function handleReject(invite: SpaceInvite) {
    try {
      // Mark invite as 'rejected'
      const { error } = await supabase
        .from('movie_space_invites')
        .update({ status: 'rejected' })
        .eq('id', invite.id);
      if (error) throw error;

      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (err) {
      console.error('Error rejecting invite:', err);
    }
  }

  if (!invites.length) {
    return <div className="text-white">No pending invites.</div>;
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <div key={invite.id} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-white">Space: {invite.movie_spaces.name}</p>
            <p className="text-sm text-neutral-400">Role: {invite.role}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(invite)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(invite)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
