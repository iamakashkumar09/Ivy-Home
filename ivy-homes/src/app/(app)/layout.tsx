'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050814] w-full">
      <Navbar />
      <main 
        className={`flex-1 w-full pt-4 sm:pt-6 pb-20 transition-opacity duration-500 ${
          !mounted || isLoading || !isAuthenticated ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
