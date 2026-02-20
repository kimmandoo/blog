'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { themeConfig } from '@/config/theme.config';

export function PSPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-12">
      <h1 className={`text-4xl font-bold ${themeConfig.colors.light.text.primary} ${themeConfig.colors.dark.text.primary} mb-4`}>
        {t('problemSolving')}
      </h1>
      <p className={`text-lg ${themeConfig.colors.light.text.secondary} ${themeConfig.colors.dark.text.secondary} mb-6`}>
        {t('psDescription')}
      </p>
    </div>
  );
}
