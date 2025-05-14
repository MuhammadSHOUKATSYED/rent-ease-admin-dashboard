'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function CreateAdmin() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const userId = data?.user?.id;
      if (!userId) {
        setError('User ID not found after signup.');
        return;
      }

      const { error: insertError } = await supabase.from('admins').insert([
        {
          id: userId,
          full_name: fullName,
        },
      ]);

      if (insertError) {
        setError('Admin signup succeeded, but failed to create admin record: ' + insertError.message);
        return;
      }

      setSuccessMessage('Admin created successfully!');
      setEmail('');
      setFullName('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      setError('An error occurred while creating the admin.');
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Create New Admin</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg px-6 pt-4 pb-6 mb-4 border border-gray-200"
        >
          {error && (
            <p className="text-red-500 text-sm font-medium mb-3 bg-red-100 border border-red-300 rounded px-3 py-2">
              {error}
            </p>
          )}

          {successMessage && (
            <div className="flex justify-between items-center text-green-700 text-sm font-medium bg-green-100 border border-green-400 rounded px-3 py-2 mb-3">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage('')}
                className="text-green-800 hover:text-green-600 font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="fullName" className="block text-gray-700 text-xs font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="adminEmail" className="block text-gray-700 text-xs font-medium mb-1">
              Admin Email
            </label>
            <input
              type="email"
              id="adminEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="adminPassword" className="block text-gray-700 text-xs font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="adminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-xs font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-md transition duration-300"
          >
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
}
