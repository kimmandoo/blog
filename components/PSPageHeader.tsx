'use client';

import { themeConfig } from '@/config/theme.config';

export function PSPageHeader() {
  return (
    <div className="mb-12">
      <h1 className={`text-4xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4`}>
        Problem Solving
      </h1>
      <p className={`text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
        알고리즘 문제 풀이 모음
      </p>
    </div>
  );
}
