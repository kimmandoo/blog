'use client';

import { useEffect, useRef } from 'react';
import { themeConfig } from '@/config/theme.config';

export function Comments() {
  const commentsRef = useRef<HTMLDivElement>(null);
  const { enabled, giscus } = themeConfig.comments;

  useEffect(() => {
    if (!enabled || !giscus.repo || !commentsRef.current) {
      return;
    }

    const container = commentsRef.current;

    // Remove existing script if any
    const existingScript = container.querySelector('script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', giscus.repo);
    script.setAttribute('data-repo-id', giscus.repoId);
    script.setAttribute('data-category', giscus.category);
    script.setAttribute('data-category-id', giscus.categoryId);
    script.setAttribute('data-mapping', giscus.mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', giscus.reactionsEnabled);
    script.setAttribute('data-emit-metadata', giscus.emitMetadata);
    script.setAttribute('data-input-position', giscus.inputPosition);
    script.setAttribute('data-theme', giscus.theme);
    script.setAttribute('data-lang', giscus.lang);
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    container.appendChild(script);

    return () => {
      const scriptToRemove = container.querySelector('script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [enabled, giscus]);

  if (!enabled) {
    return (
      <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <p className="text-center text-gray-600 dark:text-gray-400">
          댓글 기능을 사용하려면 <code className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">config/theme.config.ts</code>에서 Giscus 설정을 완료해주세요.
        </p>
        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-2">
          <a 
            href="https://giscus.app/ko" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Giscus 설정 가이드 보기
          </a>
        </p>
      </div>
    );
  }

  if (!giscus.repo || !giscus.repoId || !giscus.categoryId) {
    return (
      <div className="mt-12 p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
        <p className="text-center text-yellow-800 dark:text-yellow-200">
          ⚠️ Giscus 저장소 정보가 설정되지 않았습니다.
        </p>
        <p className="text-center text-sm text-yellow-700 dark:text-yellow-300 mt-2">
          <code className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded">config/theme.config.ts</code>에서 repo, repoId, categoryId를 설정해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-black dark:text-white">댓글</h3>
        <div className="h-0.5 w-16 bg-black dark:bg-white mt-2"></div>
      </div>
      <div ref={commentsRef} className="giscus"></div>
    </div>
  );
}
