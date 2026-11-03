'use client';

import { useState, useEffect } from 'react';
import { themeConfig } from '@/config/theme.config';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  const config = themeConfig.readingProgress;

  useEffect(() => {
    if (!config.enabled || !config.showTopBar) return;
    const content = document.getElementById('article-content');
    if (!content) return;
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const bounds = content.getBoundingClientRect();
      const start = bounds.top + window.scrollY;
      const distance = content.offsetHeight - window.innerHeight;
      const scrollProgress = distance > 0
        ? ((window.scrollY - start) / distance) * 100
        : bounds.bottom <= window.innerHeight ? 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(content);
    observer.observe(document.body);
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      observer.disconnect();
    };
  }, [config.enabled, config.showTopBar]);

  // Don't render anything if disabled
  if (!config.enabled) {
    return null;
  }

  return (
    <>
      {/* Minimalist top progress bar */}
      {config.showTopBar && (
        <div className="pointer-events-none fixed top-0 left-0 right-0 h-0.5 z-50">
          <div 
            className="reading-progress-bar h-full origin-left bg-[var(--foreground)] transition-transform duration-150 ease-out"
            style={{ transform: `scaleX(${progress / 100})` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="글 읽기 진행률"
          />
        </div>
      )}
    </>
  );
}
