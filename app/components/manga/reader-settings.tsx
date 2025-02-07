'use client';

import { useMangaStore } from '@/lib/store/manga-store';

interface ReaderSettingsProps {
  className?: string;
}

export function ReaderSettings({ className = '' }: ReaderSettingsProps) {
  const { preferences, updatePreferences } = useMangaStore();

  return (
    <div className={`fixed right-4 top-4 z-50 rounded-lg bg-white p-4 shadow-lg transition-transform duration-300 dark:bg-gray-800 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Reading Direction</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => updatePreferences({ readingDirection: 'ltr' })}
              className={`rounded-lg px-3 py-1 text-sm ${preferences.readingDirection === 'ltr'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              Left to Right
            </button>
            <button
              onClick={() => updatePreferences({ readingDirection: 'rtl' })}
              className={`rounded-lg px-3 py-1 text-sm ${preferences.readingDirection === 'rtl'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              Right to Left
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Reading Mode</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => updatePreferences({ readingMode: 'single' })}
              className={`rounded-lg px-3 py-1 text-sm ${preferences.readingMode === 'single'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              Single Page
            </button>
            <button
              onClick={() => updatePreferences({ readingMode: 'continuous' })}
              className={`rounded-lg px-3 py-1 text-sm ${preferences.readingMode === 'continuous'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              Continuous
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Image Quality</h3>
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences.dataSaver}
                onChange={(e) => updatePreferences({ dataSaver: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Data Saver
              </span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Theme</h3>
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={(e) => updatePreferences({ darkMode: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Dark Mode
              </span>
            </label>
          </div>
        </div>

        {preferences.readingMode === 'continuous' && (
          <div>
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Layout</h3>
            <div className="flex items-center space-x-2">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.noGaps}
                  onChange={(e) => updatePreferences({ noGaps: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Remove Gaps
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
