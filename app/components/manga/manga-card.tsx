import Image from 'next/image';
import Link from 'next/link';
import { MangaResponse } from '@/lib/api/mangadex';
import { mangadexApi } from '@/lib/api/mangadex';

interface MangaCardProps {
  manga: MangaResponse;
}

export function MangaCard({ manga }: MangaCardProps) {
  const coverArt = manga.relationships.find((rel) => rel.type === 'cover_art');
  const coverFilename = coverArt?.attributes?.fileName;
  const coverUrl = coverFilename ? mangadexApi.getCoverImage(manga.id, coverFilename) : null;

  const title = Object.values(manga.attributes.title)[0] || 'Unknown Title';
  const description = Object.values(manga.attributes.description)[0] || 'No description available';

  return (
    <Link
      href={`/manga/${manga.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-400 dark:text-gray-600"
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
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="mt-auto flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {manga.attributes.status}
          </span>
          {manga.attributes.year && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {manga.attributes.year}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
