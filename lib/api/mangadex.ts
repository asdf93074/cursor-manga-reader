import axios from 'axios';

const BASE_URL = 'https://api.mangadex.org';
const AT_HOME_URL = 'https://api.mangadex.org/at-home/server';

export interface MangaResponse {
  id: string;
  type: 'manga';
  attributes: {
    title: Record<string, string>;
    description: Record<string, string>;
    year: number | null;
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    contentRating: string;
    tags: Array<{ id: string; type: string; attributes: { name: Record<string, string> } }>;
    originalLanguage: string;
    lastVolume: string | null;
    lastChapter: string | null;
  };
  relationships: Array<{
    id: string;
    type: 'author' | 'artist' | 'cover_art';
    attributes?: {
      fileName?: string;
      name?: string;
    };
  }>;
}

export interface ChapterResponse {
  id: string;
  type: 'chapter';
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    pages: number;
    version: number;
  };
  relationships: Array<{
    id: string;
    type: string;
  }>;
}

export interface ChapterData {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export type MangaListType = 'popular' | 'latest' | 'trending' | 'hot' | 'all';

class MangaDexAPI {
  private api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async searchManga(query: string, offset = 0, limit = 20) {
    const response = await this.api.get<{ data: MangaResponse[]; total: number }>('/manga', {
      params: {
        title: query,
        limit,
        offset,
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive'],
        order: { relevance: 'desc' },
      },
    });
    return response.data;
  }

  async getMangaList(type: MangaListType, offset = 0, limit = 20) {
    const params: Record<string, any> = {
      limit,
      offset,
      includes: ['cover_art', 'author', 'artist'],
      contentRating: ['safe', 'suggestive'],
      order: {},
    };

    switch (type) {
      case 'popular':
        params.order = { followedCount: 'desc' };
        break;
      case 'latest':
        params.order = { latestUploadedChapter: 'desc' };
        params.hasAvailableChapters = true;
        break;
      case 'trending':
        params.order = { rating: 'desc' };
        break;
      case 'hot':
        params.order = { followedCount: 'desc', rating: 'desc' };
        break;
      default:
        params.order = { relevance: 'desc' };
    }

    const response = await this.api.get<{ data: MangaResponse[]; total: number }>('/manga', {
      params,
    });
    return response.data;
  }

  async getManga(id: string) {
    const response = await this.api.get<{ data: MangaResponse }>(`/manga/${id}`, {
      params: {
        includes: ['cover_art', 'author', 'artist'],
      },
    });
    return response.data;
  }

  async getChapters(mangaId: string, offset = 0, limit = 100) {
    const response = await this.api.get<{ data: ChapterResponse[] }>('/chapter', {
      params: {
        manga: mangaId,
        limit,
        offset,
        translatedLanguage: ['en'],
        order: { chapter: 'asc' },
      },
    });
    return response.data;
  }

  async getChapter(chapterId: string) {
    const response = await this.api.get<{ data: ChapterResponse }>(`/chapter/${chapterId}`);
    return response.data;
  }

  async getChapterImages(chapterId: string) {
    const response = await this.api.get<ChapterData>(`${AT_HOME_URL}/${chapterId}`);
    return response.data;
  }

  getCoverImage(mangaId: string, filename: string) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${filename}`;
  }

  getPageImage(baseUrl: string, chapterHash: string, filename: string, dataSaver = false) {
    const quality = dataSaver ? 'data-saver' : 'data';
    return `${baseUrl}/${quality}/${chapterHash}/${filename}`;
  }
}

export const mangadexApi = new MangaDexAPI();
