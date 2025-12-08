'use client';

import { useState, useEffect } from 'react';

interface ReadingProgressBarProps {
  readingTime?: number; // in minutes
}

export function ReadingProgressBar({ readingTime }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
      
      // Show indicator after scrolling a bit
      setIsVisible(scrollTop > 100);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Calculate time remaining based on progress and total reading time
  const timeRemaining = readingTime ? Math.ceil(readingTime * (1 - progress / 100)) : 0;
  const timeRead = readingTime ? Math.ceil(readingTime * (progress / 100)) : 0;

  return (
    <>
      {/* Minimalist top progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50">
        <div 
          className="h-full bg-gradient-to-r from-black via-gray-700 to-black dark:from-white dark:via-gray-300 dark:to-white transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating progress indicator - modern minimal design */}
      {readingTime && isVisible && (
        <div 
          className={`fixed bottom-8 right-8 z-40 transition-all duration-300 ${
            progress >= 99 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="relative group">
            {/* Circular progress indicator */}
            <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-center">
              {/* Background circle */}
              <svg className="absolute w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="text-black dark:text-white transition-all duration-150"
                  strokeLinecap="round"
                />
              </svg>
              {/* Progress percentage */}
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 z-10">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Tooltip on hover - shows time remaining */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 dark:bg-white/90 text-white dark:text-black text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {timeRemaining > 0 ? (
                <span>{timeRemaining}분 남음 · {timeRead}/{readingTime}분</span>
              ) : (
                <span>읽기 완료!</span>
              )}
              {/* Arrow */}
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-black/90 dark:border-t-white/90" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
