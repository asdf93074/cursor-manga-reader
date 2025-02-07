import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReadingHistory {
  mangaId: string;
  chapterId: string;
  page: number;
  timestamp: number;
}

interface ReadingPreferences {
  readingDirection: 'ltr' | 'rtl';
  readingMode: 'single' | 'continuous';
  dataSaver: boolean;
  darkMode: boolean;
  noGaps: boolean;
}

interface MangaStore {
  readingHistory: Record<string, ReadingHistory>;
  preferences: ReadingPreferences;
  currentManga: string | null;
  currentChapter: string | null;
  currentPage: number;

  // Actions
  updateReadingHistory: (mangaId: string, chapterId: string, page: number) => void;
  updatePreferences: (preferences: Partial<ReadingPreferences>) => void;
  setCurrentManga: (mangaId: string | null) => void;
  setCurrentChapter: (chapterId: string | null) => void;
  setCurrentPage: (page: number) => void;
}

export const useMangaStore = create<MangaStore>()(
  persist(
    (set) => ({
      readingHistory: {},
      preferences: {
        readingDirection: 'rtl',
        readingMode: 'single',
        dataSaver: false,
        darkMode: false,
        noGaps: true,
      },
      currentManga: null,
      currentChapter: null,
      currentPage: 1,

      updateReadingHistory: (mangaId, chapterId, page) =>
        set((state) => ({
          readingHistory: {
            ...state.readingHistory,
            [mangaId]: {
              mangaId,
              chapterId,
              page,
              timestamp: Date.now(),
            },
          },
        })),

      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        })),

      setCurrentManga: (mangaId) => set({ currentManga: mangaId }),
      setCurrentChapter: (chapterId) => set({ currentChapter: chapterId }),
      setCurrentPage: (page) => set({ currentPage: page }),
    }),
    {
      name: 'manga-store',
    }
  )
);
