'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChapterData, ChapterResponse } from '@/lib/api/mangadex';
import { useMangaStore } from '@/lib/store/manga-store';
import { ReaderSettings } from './reader-settings';
import Link from 'next/link';

// Add this type at the top of the file, before the ChapterReaderProps interface
declare global {
  interface Window {
    Image: {
      new(width?: number, height?: number): HTMLImageElement;
    };
  }
}

interface ChapterReaderProps {
  chapterData: ChapterData;
  chapterInfo: ChapterResponse;
  nextChapterId?: string;
  prevChapterId?: string;
  mangaId: string;
  mangaTitle: string;
  chapters: ChapterResponse[];
}

interface ImageDimensions {
  width: number;
  height: number;
}

export function ChapterReader({
  chapterData,
  chapterInfo,
  nextChapterId,
  prevChapterId,
  mangaId,
  mangaTitle,
  chapters,
}: ChapterReaderProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [loadingPage, setLoadingPage] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const {
    preferences: { readingDirection, readingMode, dataSaver, noGaps },
    updatePreferences,
    updateReadingHistory,
    setCurrentPage: setStorePage,
  } = useMangaStore();

  const imageUrls = dataSaver ? chapterData.chapter.dataSaver : chapterData.chapter.data;
  const totalPages = imageUrls?.length ?? 0;
  const hasPages = totalPages > 0;

  const getImageUrl = useCallback(
    (index: number) => {
      const filename = imageUrls[index];
      const quality = dataSaver ? 'data-saver' : 'data';
      return `${chapterData.baseUrl}/${quality}/${chapterData.chapter.hash}/${filename}`;
    },
    [chapterData.baseUrl, chapterData.chapter.hash, dataSaver, imageUrls]
  );

  // Calculate container dimensions based on image aspect ratio
  const getContainerStyle = useCallback(() => {
    if (!imageDimensions || !containerRef.current) return {};

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = window.innerHeight - 100; // Reduced padding for more space
    const imageAspectRatio = imageDimensions.width / imageDimensions.height;
    const containerAspectRatio = containerWidth / containerHeight;

    // Always fit to width first, then adjust height accordingly
    const width = containerWidth;
    const height = containerWidth / imageAspectRatio;

    // If the height is too tall for the container, scale it down
    if (height > containerHeight) {
      return {
        width: containerHeight * imageAspectRatio,
        height: containerHeight,
      };
    }

    return {
      width,
      height,
    };
  }, [imageDimensions]);

  // Preload images and get dimensions
  useEffect(() => {
    if (readingMode === 'single') {
      const preloadCount = 2;
      const imagesToPreload = [];

      for (let i = 0; i < preloadCount; i++) {
        const nextPageIndex = currentPage + i;
        if (nextPageIndex <= totalPages) {
          imagesToPreload.push(nextPageIndex);
        }
      }

      imagesToPreload.forEach((pageNum) => {
        const img = new window.Image();
        img.onload = () => {
          if (pageNum === currentPage) {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          }
        };
        img.src = getImageUrl(pageNum - 1);
      });
    }
  }, [currentPage, getImageUrl, readingMode, totalPages]);

  useEffect(() => {
    setStorePage(currentPage);
    updateReadingHistory(chapterInfo.relationships[0].id, chapterInfo.id, currentPage);
  }, [currentPage, chapterInfo.id, chapterInfo.relationships, setStorePage, updateReadingHistory]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (readingMode === 'single') {
        if (
          (readingDirection === 'ltr' && e.key === 'ArrowRight') ||
          (readingDirection === 'rtl' && e.key === 'ArrowLeft')
        ) {
          if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
          } else if (nextChapterId) {
            router.push(`/chapter/${nextChapterId}`);
          }
        } else if (
          (readingDirection === 'ltr' && e.key === 'ArrowLeft') ||
          (readingDirection === 'rtl' && e.key === 'ArrowRight')
        ) {
          if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
          } else if (prevChapterId) {
            router.push(`/chapter/${prevChapterId}`);
          }
        } else if (e.key === 's') {
          setShowSettings((prev) => !prev);
        }
      }
    },
    [currentPage, nextChapterId, prevChapterId, readingDirection, readingMode, router, totalPages]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault(); // Prevent page scroll
    const delta = e.deltaY * -0.002; // Adjust zoom sensitivity
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 3));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      // Add grab cursor
      const target = e.currentTarget as HTMLElement;
      target.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Calculate boundaries
      if (containerRef.current && imageDimensions) {
        const container = containerRef.current.getBoundingClientRect();
        const scaledWidth = containerStyle.width! * zoom;
        const scaledHeight = containerStyle.height! * zoom;

        // Calculate max boundaries
        const maxX = (scaledWidth - container.width) / 2;
        const maxY = (scaledHeight - container.height) / 2;

        // Clamp position within boundaries
        const clampedX = Math.max(-maxX, Math.min(maxX, newX));
        const clampedY = Math.max(-maxY, Math.min(maxY, newY));

        setPosition({ x: clampedX, y: clampedY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
    }
  };

  const handleImageLoad = (pageNumber: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    if (pageNumber === currentPage) {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      imageRef.current = img;
    }
    setLoadedImages((prev) => new Set([...prev, pageNumber]));
    setLoadingPage(false);
    setImageError(null);
  };

  const handleImageError = (pageNumber: number) => {
    console.error(`Failed to load image ${pageNumber}`);
    setImageError(`Failed to load page ${pageNumber}. Please try again or switch to data saver mode.`);
    setLoadingPage(false);
  };

  // Reset zoom and position when changing pages
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setLoadingPage(true);
    setImageDimensions(null);
  }, [currentPage]);

  // Handle empty chapter
  useEffect(() => {
    if (!hasPages) {
      setImageError("This chapter has no pages available.");
      setLoadingPage(false);
    }
  }, [hasPages]);

  const containerStyle = getContainerStyle();

  const handleChapterChange = (chapterId: string) => {
    router.push(`/chapter/${chapterId}`);
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      <ReaderSettings className={showSettings ? 'translate-x-0' : 'translate-x-full'} />
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed right-4 top-4 z-50 rounded-lg bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {imageError && (
        <div className="fixed left-4 right-4 top-4 z-50 rounded-lg bg-red-500 p-4 text-white">
          {imageError}
        </div>
      )}

      {/* Chapter Navigation Header */}
      <div className="fixed left-0 right-0 top-0 z-30 bg-gray-950/90 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-[2000px] items-center justify-between px-4">
          <Link
            href={`/manga/${mangaId}`}
            className="text-lg font-semibold text-white hover:text-blue-400"
          >
            {mangaTitle}
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-white">
              Chapter {chapterInfo.attributes.chapter}
              {chapterInfo.attributes.title && ` - ${chapterInfo.attributes.title}`}
            </span>
            <select
              value={chapterInfo.id}
              onChange={(e) => handleChapterChange(e.target.value)}
              className="w-64 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  Chapter {chapter.attributes.chapter}
                  {chapter.attributes.title && ` - ${chapter.attributes.title}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {readingMode === 'single' ? (
        <div className="h-screen bg-gray-900 pt-20">
          {hasPages ? (
            <div className="relative mx-auto h-[calc(100vh-12rem)] max-w-[2000px] px-4">
              <div
                ref={containerRef}
                className="relative flex h-full w-full items-center justify-center overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                }}
              >
                {loadingPage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                  </div>
                )}
                <div
                  className="relative transition-transform duration-100"
                  style={{
                    transform: `scale(${zoom})`,
                    width: containerStyle.width,
                    height: containerStyle.height,
                  }}
                >
                  <Image
                    src={getImageUrl(currentPage - 1)}
                    alt={`Page ${currentPage}`}
                    fill
                    className="object-contain"
                    priority={true}
                    onLoad={(e) => handleImageLoad(currentPage, e)}
                    onError={() => handleImageError(currentPage)}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="mb-4 text-xl text-white">No pages available for this chapter.</p>
                <div className="flex justify-center space-x-4">
                  {prevChapterId && (
                    <button
                      onClick={() => router.push(`/chapter/${prevChapterId}`)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      Previous Chapter
                    </button>
                  )}
                  {nextChapterId && (
                    <button
                      onClick={() => router.push(`/chapter/${nextChapterId}`)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      Next Chapter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {hasPages && (
            <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-gray-950/90 p-4 backdrop-blur">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage((prev) => prev - 1);
                  } else if (prevChapterId) {
                    router.push(`/chapter/${prevChapterId}`);
                  }
                }}
                disabled={!prevChapterId && currentPage === 1}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {currentPage === 1 ? "Previous Chapter" : "Previous"}
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <span className="text-sm text-gray-300">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage((prev) => prev + 1);
                  } else if (nextChapterId) {
                    router.push(`/chapter/${nextChapterId}`);
                  }
                }}
                disabled={!nextChapterId && currentPage === totalPages}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {currentPage === totalPages ? "Next Chapter" : "Next"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="container mx-auto px-4 pt-20">
          <div className="mx-auto max-w-[2000px] space-y-0">
            {hasPages ? (
              imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={`relative w-full ${noGaps ? '-mb-1' : 'mb-4'}`}
                  style={{ height: 'calc(100vh - 2rem)' }}
                >
                  {!loadedImages.has(index + 1) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    </div>
                  )}
                  <Image
                    src={getImageUrl(index)}
                    alt={`Page ${index + 1}`}
                    fill
                    className="object-contain"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onLoad={(e) => handleImageLoad(index + 1, e)}
                    onError={() => handleImageError(index + 1)}
                    unoptimized
                  />
                </div>
              ))
            ) : (
              <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
                <div className="text-center">
                  <p className="mb-4 text-xl text-white">No pages available for this chapter.</p>
                  <div className="flex justify-center space-x-4">
                    {prevChapterId && (
                      <button
                        onClick={() => router.push(`/chapter/${prevChapterId}`)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                      >
                        Previous Chapter
                      </button>
                    )}
                    {nextChapterId && (
                      <button
                        onClick={() => router.push(`/chapter/${nextChapterId}`)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                      >
                        Next Chapter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
