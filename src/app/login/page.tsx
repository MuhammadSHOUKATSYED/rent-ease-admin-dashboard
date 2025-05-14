'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient'; // Adjust the import if needed
import { useRouter } from 'next/navigation';

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const userId = signInData?.user?.id;

    if (!userId) {
      setError('User ID not found after login.');
      return;
    }

    // Check if the user exists in the admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .single();

    if (adminError || !adminData) {
      // If not an admin, sign out and show error
      await supabase.auth.signOut();
      setError('Access denied. You are not authorized as an admin.');
      return;
    }

    // Redirect if the user is an admin
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Sign in</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg px-6 pt-4 pb-6 mb-4 border border-gray-200"
        >
          <div className="mb-3">
            <label htmlFor="email" className="block text-gray-700 text-xs font-medium mb-1">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-xs font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-md transition duration-300"
          >
            Sign in
          </button>

          <div className="mt-4 text-xs text-center text-gray-600">
            <a href="#" className="text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
