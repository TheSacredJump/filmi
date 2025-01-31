'use client';

import React, { FormEvent } from 'react';
import { X, Users } from 'lucide-react';

interface NewActorState {
  name: string;
  imageFile: File | null;
}

interface AddActorModalProps {
  isOpen: boolean;
  error?: string;
  newActor: NewActorState;
  onClose: () => void;
  onChange: (updated: Partial<NewActorState>) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AddActorModal({
  isOpen,
  error,
  newActor,
  onClose,
  onChange,
  onSubmit,
}: AddActorModalProps) {
  if (!isOpen) return null;

  const handleActorFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange({ imageFile: e.target.files[0] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Add Actor</h3>
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
              Actor Name
            </label>
            <input
              type="text"
              value={newActor.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1">
              Actor Image
            </label>
            <div className="flex gap-4 items-start">
              {newActor.imageFile ? (
                <div className="relative w-32 aspect-square rounded-lg overflow-hidden group">
                  <img
                    src={URL.createObjectURL(newActor.imageFile)}
                    alt="Selected actor"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ imageFile: null })}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-32 aspect-square bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-neutral-700" />
                </div>
              )}
              <div className="flex-1">
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleActorFileSelect}
                  />
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white hover:border-purple-500 transition-colors cursor-pointer">
                    {newActor.imageFile ? 'Change Image' : 'Upload Image'}
                  </div>
                </label>
                <p className="text-xs text-neutral-500 mt-2">
                  Recommended: Square image, max 2MB
                </p>
              </div>
            </div>
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
              Add Actor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
