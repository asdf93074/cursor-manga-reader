'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { mangadexApi, MangaListType } from '@/lib/api/mangadex';
import { MangaCard } from '@/app/components/manga/manga-card';
import { useDebounce } from '@/lib/hooks/use-debounce';

const ITEMS_PER_PAGE = 20;

const LIST_TYPES: { label: string; value: MangaListType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Popular', value: 'popular' },
  { label: 'Trending', value: 'trending' },
  { label: 'Hot', value: 'hot' },
  { label: 'Latest', value: 'latest' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MangaListType>('popular');
  const debouncedQuery = useDebounce(searchQuery, 500);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['manga-list', selectedType, debouncedQuery],
    queryFn: ({ pageParam = 0 }) =>
      debouncedQuery
        ? mangadexApi.searchManga(debouncedQuery, pageParam, ITEMS_PER_PAGE)
        : mangadexApi.getMangaList(selectedType, pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * ITEMS_PER_PAGE;
      return nextOffset < (lastPage.total || 0) ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const allManga = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manga Reader
        </h1>

        {/* Search and Filter Controls */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manga..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {LIST_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedType === type.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              style={{ height: '400px' }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/50 dark:text-red-200">
          <p>Error loading manga. Please try again later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

          {/* Loading indicator and observer target */}
          <div
            ref={observerTarget}
            className="mt-8 flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            )}
          </div>

          {/* No results message */}
          {allManga.length === 0 && !isLoading && (
            <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
              No manga found. Try adjusting your search or filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}
