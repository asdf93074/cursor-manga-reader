'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mangadexApi } from '@/lib/api/mangadex';
import { ChapterReader } from '@/app/components/manga/chapter-reader';
import { useMangaStore } from '@/lib/store/manga-store';

interface ChapterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const { id } = use(params);
  const setCurrentChapter = useMangaStore((state) => state.setCurrentChapter);

  const { data: chapterInfo, isLoading: isChapterLoading } = useQuery({
    queryKey: ['chapter', id],
    queryFn: () => mangadexApi.getChapter(id),
  });

  const { data: chapterData, isLoading: isImagesLoading } = useQuery({
    queryKey: ['chapter-images', id],
    queryFn: () => mangadexApi.getChapterImages(id),
    enabled: !!chapterInfo,
  });

  const mangaId = chapterInfo?.data.relationships.find(rel => rel.type === 'manga')?.id;

  const { data: mangaData, isLoading: isMangaLoading } = useQuery({
    queryKey: ['manga', mangaId],
    queryFn: () => mangadexApi.getManga(mangaId!),
    enabled: !!mangaId,
  });

  const { data: chaptersData, isLoading: isChaptersLoading } = useQuery({
    queryKey: ['manga-chapters', mangaId],
    queryFn: () => mangadexApi.getChapters(mangaId!),
    enabled: !!mangaId,
  });

  useEffect(() => {
    setCurrentChapter(id);
    return () => setCurrentChapter(null);
  }, [id, setCurrentChapter]);

  if (isChapterLoading || isImagesLoading || isMangaLoading || isChaptersLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!chapterInfo?.data || !chapterData || !mangaData?.data || !chaptersData?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/50 dark:text-red-200">
          <p>Error loading chapter. Please try again later.</p>
        </div>
      </div>
    );
  }

  const chapters = chaptersData.data;
  const currentChapterIndex = chapters.findIndex((chapter) => chapter.id === id);
  const nextChapter = chapters[currentChapterIndex + 1];
  const prevChapter = chapters[currentChapterIndex - 1];
  const mangaTitle = Object.values(mangaData.data.attributes.title)[0] || 'Unknown Title';

  return (
    <ChapterReader
      chapterData={chapterData}
      chapterInfo={chapterInfo.data}
      nextChapterId={nextChapter?.id}
      prevChapterId={prevChapter?.id}
      mangaId={mangaId!}
      mangaTitle={mangaTitle}
      chapters={chapters}
    />
  );
}
