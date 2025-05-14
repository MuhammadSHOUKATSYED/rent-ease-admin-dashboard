'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); // Redirect if not logged in
      } else {
        setLoading(false); // Allow access
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return <>{children}</>;
}