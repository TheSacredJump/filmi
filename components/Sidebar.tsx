'use client';

import React from 'react';
import { Film, List, Users, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// An interface for the sidebar props
interface SidebarProps {
  spaceName?: string;
  spaceDescription?: string;
  activeTab: string;
  onTabChange: (tab: 'watched' | 'wishlist' | 'actors') => void;
}

export function Sidebar({
  spaceName,
  spaceDescription,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const router = useRouter();

  return (
    <div className="w-64 bg-neutral-900 min-h-screen fixed left-0 top-0 p-6">
      <div className="flex items-center gap-3 mb-8">
        <Film className="w-8 h-8 text-purple-400" />
        <h1 className="text-xl font-bold">Filmi</h1>
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-white">{spaceName}</h2>
        <p className="text-sm text-neutral-400">{spaceDescription}</p>
      </div>

      <nav className="space-y-2">
        <button
          onClick={() => onTabChange('watched')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
            activeTab === 'watched'
              ? 'bg-purple-500/20 text-purple-400'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Film className="w-5 h-5" />
          <span>Watched</span>
        </button>
        <button
          onClick={() => onTabChange('wishlist')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
            activeTab === 'wishlist'
              ? 'bg-purple-500/20 text-purple-400'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <List className="w-5 h-5" />
          <span>Wishlist</span>
        </button>
        <button
          onClick={() => onTabChange('actors')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
            activeTab === 'actors'
              ? 'bg-purple-500/20 text-purple-400'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Actors</span>
        </button>
        
      </nav>
    </div>
  );
}
