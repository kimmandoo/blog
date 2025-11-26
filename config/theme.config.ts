/**
 * Theme configuration file
 * Customize colors, fonts, and other design settings here
 */

export const themeConfig = {
  // Site information
  site: {
    title: 'kimmandoo.log',
    description: 'struggle',
    tagline: '발버둥치는 중',
  },

  // Color scheme
  colors: {
    // Light mode colors
    light: {
      background: {
        primary: 'from-white via-gray-50 to-gray-100',
        card: 'bg-white',
        cardHover: 'hover:border-gray-300',
      },
      text: {
        primary: 'text-black',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500',
      },
      border: {
        primary: 'border-gray-100',
        secondary: 'border-gray-200',
      },
      accent: {
        primary: 'bg-black text-white',
        gradient: 'from-black via-gray-700 to-black',
      },
      code: {
        background: 'bg-gray-100',
        text: 'text-gray-800',
      },
    },
    // Dark mode colors
    dark: {
      background: {
        primary: 'dark:from-black dark:via-gray-900 dark:to-black',
        card: 'dark:bg-gray-900',
        cardHover: 'dark:hover:border-gray-700',
      },
      text: {
        primary: 'dark:text-white',
        secondary: 'dark:text-gray-400',
        tertiary: 'dark:text-gray-500',
      },
      border: {
        primary: 'dark:border-gray-800',
        secondary: 'dark:border-gray-800',
      },
      accent: {
        primary: 'dark:bg-white dark:text-black',
        gradient: 'dark:from-white dark:via-gray-300 dark:to-white',
      },
      code: {
        background: 'dark:bg-gray-800',
        text: 'dark:text-gray-200',
      },
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Courier New", Courier, monospace',
    },
    fontSize: {
      title: 'text-6xl',
      heading: 'text-3xl',
      subheading: 'text-xl',
      body: 'text-lg',
      small: 'text-sm',
    },
  },

  // Spacing
  spacing: {
    container: 'max-w-4xl',
    section: 'py-20',
    card: 'p-8',
  },

  // Border radius
  borderRadius: {
    card: 'rounded-2xl',
    button: 'rounded-full',
    image: 'rounded-2xl',
  },

  // Shadows
  shadows: {
    card: 'shadow-sm hover:shadow-xl',
    button: 'shadow-lg hover:shadow-2xl',
  },

  // Animations
  animations: {
    transition: 'transition-all duration-300',
    hover: 'hover:-translate-y-1',
    scale: 'hover:scale-105',
  },

  // Category and Tag settings
  taxonomy: {
    categories: {
      colors: [
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      ],
    },
    tags: {
      style: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      hoverStyle: 'hover:bg-gray-200 dark:hover:bg-gray-700',
    },
  },

  // Comments configuration
  comments: {
    enabled: true,
    // Giscus configuration (GitHub Discussions-based comments)
    giscus: {
      repo: 'kimmandoo/blog', // Format: 'username/repo'
      repoId: 'R_kgDOQddTJQ',
      category: 'General',
      categoryId: 'DIC_kwDOQddTJc4CzEYe',
      mapping: 'pathname',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'top',
      theme: 'preferred_color_scheme',
      lang: 'ko',
    },
  },

  // UI Text (easily change language here)
  text: {
    categories: '카테고리',
    tags: '태그',
    filter: '필터:',
    noPostsFound: '선택한 필터에 해당하는 게시글이 없습니다.',
    viewAllPosts: '전체 게시글 보기',
    comments: '댓글',
    commentsSetupRequired: '댓글 기능을 사용하려면',
    commentsSetupInConfig: '에서 Giscus 설정을 완료해주세요.',
    commentsSetupGuide: 'Giscus 설정 가이드 보기',
    giscusNotConfigured: '⚠️ Giscus 저장소 정보가 설정되지 않았습니다.',
    giscusConfigInstructions: '에서 repo, repoId, categoryId를 설정해주세요.',
  },
};

export type ThemeConfig = typeof themeConfig;
