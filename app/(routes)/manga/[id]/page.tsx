'use client';

import { useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { mangadexApi } from '@/lib/api/mangadex';
import { useMangaStore } from '@/lib/store/manga-store';

interface MangaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MangaDetailPage({ params }: MangaDetailPageProps) {
  const { id } = use(params);
  const setCurrentManga = useMangaStore((state) => state.setCurrentManga);
  const readingHistory = useMangaStore((state) => state.readingHistory[id]);

  const { data: mangaData, isLoading: isMangaLoading } = useQuery({
    queryKey: ['manga', id],
    queryFn: () => mangadexApi.getManga(id),
  });

  const { data: chaptersData, isLoading: isChaptersLoading } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => mangadexApi.getChapters(id),
  });

  useEffect(() => {
    setCurrentManga(id);
    return () => setCurrentManga(null);
  }, [id, setCurrentManga]);

  if (isMangaLoading || isChaptersLoading) {
    return (
      <div className="container mx-auto animate-pulse px-4 py-8">
        <div className="h-96 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!mangaData?.data || !chaptersData?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/50 dark:text-red-200">
          <p>Error loading manga details. Please try again later.</p>
        </div>
      </div>
    );
  }

  const manga = mangaData.data;
  const chapters = chaptersData.data;

  const coverArt = manga.relationships.find((rel) => rel.type === 'cover_art');
  const coverFilename = coverArt?.attributes?.fileName;
  const coverUrl = coverFilename ? mangadexApi.getCoverImage(manga.id, coverFilename) : null;

  const title = Object.values(manga.attributes.title)[0] || 'Unknown Title';
  const description = Object.values(manga.attributes.description)[0] || 'No description available';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg
                  className="h-24 w-24 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {manga.attributes.status}
              </span>
              {manga.attributes.year && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {manga.attributes.year}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chapters
            </h2>
            <div className="divide-y divide-gray-200 rounded-lg border dark:divide-gray-800 dark:border-gray-800">
              {chapters.map((chapter) => {
                const isRead = readingHistory?.chapterId === chapter.id;
                return (
                  <Link
                    key={chapter.id}
                    href={`/chapter/${chapter.id}`}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Chapter {chapter.attributes.chapter}
                        </span>
                        {chapter.attributes.title && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            - {chapter.attributes.title}
                          </span>
                        )}
                      </div>
                      {isRead && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Last read
                        </span>
                      )}
                    </div>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
