'use client';

import { themeConfig } from '@/config/theme.config';

export function AndroidPageHeader() {
  return (
    <div className="mb-12">
      <h1 className={`text-4xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4`}>
        안드로이드
      </h1>
      <p className={`text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
        안드로이드 개발에 필요한 지식을 개인적으로 정리한 장소입니다.
      </p>
    </div>
  );
}
