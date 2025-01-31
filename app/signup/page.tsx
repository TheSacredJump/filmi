// app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { Film, Mail, Lock, User } from 'lucide-react';
import { moviePosters } from '@/constants/movieposters';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create a profile in your profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: formData.username,
              email: formData.email,
            },
          ]);

        if (profileError) throw profileError;
        
        router.push('/dashboard'); // Redirect to dashboard after successful signup
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen flex items-center justify-center overflow-hidden">
      <div className="w-3/5 min-h-screen bg-neutral-950 p-8 relative overflow-hidden">
        {/* Movie Poster Grid */}
        <div className="grid grid-cols-4 gap-4 opacity-40">
          {moviePosters.map((poster) => (
            <div 
              key={poster.id} 
              className="aspect-[2/3] rounded-lg overflow-hidden group relative"
            >
              <img 
                src={poster.src}
                alt={poster.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium">{poster.title}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Film className="w-24 h-24 text-purple-400" />
              <h1 className="text-6xl font-bold text-white">Filmi</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="w-2/5 bg-gradient-to-l from-indigo-950 to-purple-500 min-h-screen flex justify-center items-center">
        <div className="rounded-xl bg-neutral-950 backdrop-blur-xl p-10 w-96">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Create Account</h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm text-purple-200 block">Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-purple-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-neutral-900 border border-purple-500/30 rounded-lg py-2 px-10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-200 block">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-purple-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-neutral-900 border border-purple-500/30 rounded-lg py-2 px-10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-200 block">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-purple-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-neutral-900 border border-purple-500/30 rounded-lg py-2 px-10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-2 font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Already have an account?{' '}
              <Link href="/" className="text-purple-400 hover:text-purple-300">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}