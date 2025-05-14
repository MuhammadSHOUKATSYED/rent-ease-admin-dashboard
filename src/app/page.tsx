'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Background image (left side) */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: "url('/1.png')", // ✅ Use your local image
        }}
      />

      {/* Content (right side) */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center text-center px-8 py-12">
        <div className="max-w-sm w-full">
          <img
            src="/Logo.png"
            alt="RentEase Logo"
            className="w-24 h-24 object-cover rounded-2xl mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-purple-600">RentEase</span>
          </h1>
          <p className="text-sm text-gray-600 mb-6 font-light">
            Rent Anything, Manage Everything.
          </p>
          <Link
            href="/login"
            className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
