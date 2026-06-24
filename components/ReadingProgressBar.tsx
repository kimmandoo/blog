'use client';

import { useState, useEffect } from 'react';
import { themeConfig } from '@/config/theme.config';

interface ReadingProgressBarProps {
  readingTime?: number; // in minutes
}

export function ReadingProgressBar({}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);

  const config = themeConfig.readingProgress;

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Don't render anything if disabled
  if (!config.enabled) {
    return null;
  }

  return (
    <>
      {/* Minimalist top progress bar */}
      {config.showTopBar && (
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50">
          <div 
            className="reading-progress-bar h-full origin-left bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 transition-transform duration-150 ease-out shadow-sm"
            style={{ transform: `scaleX(${progress / 100})` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
          />
        </div>
      )}
    </>
  );
}
