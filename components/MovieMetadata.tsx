'use client';

import React from 'react';

interface MovieMetadataProps {
  addedBy?: string;
  createdAt: string;
}

export function MovieMetadata({ addedBy, createdAt }: MovieMetadataProps) {
  return (
    <div className="border-t border-neutral-800 pt-6 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-neutral-500">Added by</p>
          <p className="text-neutral-300">{addedBy || 'Unknown User'}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-500">Added on</p>
          <p className="text-neutral-300">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
