'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMangaStore } from '@/lib/store/manga-store';

export function Navbar() {
  const pathname = usePathname();
  const { preferences, updatePreferences } = useMangaStore();

  const isReaderPage = pathname.startsWith('/chapter/');

  if (isReaderPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
        >
          Manga Reader
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => updatePreferences({ darkMode: !preferences.darkMode })}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            {preferences.darkMode ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
