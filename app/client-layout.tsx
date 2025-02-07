'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMangaStore } from '@/lib/store/manga-store';
import { Navbar } from './components/layout/navbar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const darkMode = useMangaStore((state) => state.preferences.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-900 dark:text-white ${darkMode ? 'dark' : ''}`}>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        {children}
      </QueryClientProvider>
    </div>
  );
}
