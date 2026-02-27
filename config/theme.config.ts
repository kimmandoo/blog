/**
 * Theme configuration file
 * Customize colors, fonts, and other design settings here
 */

export const themeConfig = {
  // Site information
  site: {
    title: 'mandoo.log',
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
      title: 'text-3xl',
      heading: 'text-2xl',
      subheading: 'text-xl',
      body: 'text-base',
      small: 'text-sm',
    },
  },

  // Prose styling for post body content
  // Easy to modify text sizes, colors, and spacing
  // Note: Use only standard Tailwind classes (text-*, prose-*) to ensure proper CSS generation
  prose: {
    // Base prose size: prose-sm, prose-base, prose-lg, prose-xl, prose-2xl
    size: 'prose-base',
    // Heading sizes: text-xl, text-2xl, text-3xl, text-4xl, text-5xl, etc.
    h1: 'text-3xl',
    h2: 'text-2xl',
    h3: 'text-xl',
    h4: 'text-lg',
    // Paragraph text color: text-gray-600, text-gray-700, text-gray-800, etc.
    paragraphColor: {
      light: 'text-gray-700',
      dark: 'text-gray-300',
    },
    // List text color
    listColor: {
      light: 'text-gray-700',
      dark: 'text-gray-300',
    },
  },

  // Spacing
  spacing: {
    container: 'max-w-4xl',
    postWidth: 'max-w-4xl',
    section: 'py-16',
    card: 'p-6',
  },

  // Border radius
  borderRadius: {
    card: 'rounded-none',
    button: 'rounded-full',
    image: 'rounded-lg',
  },

  // Shadows
  shadows: {
    card: '',
    button: 'shadow-lg hover:shadow-2xl',
  },

  // Animations
  animations: {
    transition: 'transition-all duration-200',
    hover: '',
    scale: 'hover:scale-105',
  },

  // Category and Tag settings
  taxonomy: {
    categories: {
      colors: [
        'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white dark:from-blue-400/90 dark:to-blue-500/90 dark:text-white',
        'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 text-white dark:from-emerald-400/90 dark:to-emerald-500/90 dark:text-white',
        'bg-gradient-to-r from-violet-500/90 to-violet-600/90 text-white dark:from-violet-400/90 dark:to-violet-500/90 dark:text-white',
        'bg-gradient-to-r from-rose-500/90 to-rose-600/90 text-white dark:from-rose-400/90 dark:to-rose-500/90 dark:text-white',
        'bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white dark:from-amber-400/90 dark:to-amber-500/90 dark:text-white',
        'bg-gradient-to-r from-indigo-500/90 to-indigo-600/90 text-white dark:from-indigo-400/90 dark:to-indigo-500/90 dark:text-white',
        'bg-gradient-to-r from-cyan-500/90 to-cyan-600/90 text-white dark:from-cyan-400/90 dark:to-cyan-500/90 dark:text-white',
        'bg-gradient-to-r from-fuchsia-500/90 to-fuchsia-600/90 text-white dark:from-fuchsia-400/90 dark:to-fuchsia-500/90 dark:text-white',
        'bg-gradient-to-r from-teal-500/90 to-teal-600/90 text-white dark:from-teal-400/90 dark:to-teal-500/90 dark:text-white',
        'bg-gradient-to-r from-orange-500/90 to-orange-600/90 text-white dark:from-orange-400/90 dark:to-orange-500/90 dark:text-white',
        'bg-gradient-to-r from-pink-500/90 to-pink-600/90 text-white dark:from-pink-400/90 dark:to-pink-500/90 dark:text-white',
        'bg-gradient-to-r from-lime-500/90 to-lime-600/90 text-white dark:from-lime-400/90 dark:to-lime-500/90 dark:text-white',
        'bg-gradient-to-r from-sky-500/90 to-sky-600/90 text-white dark:from-sky-400/90 dark:to-sky-500/90 dark:text-white',
        'bg-gradient-to-r from-purple-500/90 to-purple-600/90 text-white dark:from-purple-400/90 dark:to-purple-500/90 dark:text-white',
        'bg-gradient-to-r from-red-500/90 to-red-600/90 text-white dark:from-red-400/90 dark:to-red-500/90 dark:text-white',
        'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 text-white dark:from-yellow-400/90 dark:to-yellow-500/90 dark:text-white',
      ],
    },
    tags: {
      style: 'bg-white/90 text-gray-800 dark:bg-gray-800/90 dark:text-gray-100',
      hoverStyle: 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-white hover:text-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800 dark:hover:text-white',
    },
  },

  // Code block configuration
  codeBlock: {
    // Enable/disable line numbers
    showLineNumbers: false,
    // Starting line number (usually 1)
    startLineNumber: 1,
    // Show copy button on hover
    showCopyButton: true,
    // Show language badge
    showLanguageBadge: true,
    // Colors for code blocks
    colors: {
      // Background gradient
      background: 'linear-gradient(135deg, #1e1e2e 0%, #181825 100%)',
      // Text color
      text: '#e6e6e6',
      // Line number color
      lineNumber: '#6c7086',
      // Line number background
      lineNumberBackground: 'rgba(0, 0, 0, 0.2)',
      // Border color
      border: 'rgba(255, 255, 255, 0.1)',
      // Copy button colors
      copyButton: {
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.15)',
        text: '#e6e6e6',
        hoverBackground: 'rgba(255, 255, 255, 0.12)',
        copiedBackground: 'rgba(16, 185, 129, 0.15)',
        copiedBorder: 'rgba(16, 185, 129, 0.3)',
        copiedText: '#10b981',
      },
      // Language badge colors
      languageBadge: {
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.1)',
        text: '#888',
      },
    },
    // Border radius
    borderRadius: '0.75rem',
    // Padding
    padding: '0.5em',
  },

  // Inline code configuration
  inlineCode: {
    colors: {
      light: {
        background: '#f1f5f9',
        text: '#0f172a',
        border: '#e2e8f0',
      },
      dark: {
        background: '#334155',
        text: '#f1f5f9',
        border: '#475569',
      },
    },
    // Border radius
    borderRadius: '0.375rem',
    // Padding
    paddingX: '0.4em',
    paddingY: '0.2em',
    // Font size relative to text
    fontSize: '0.9em',
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

  // SEO configuration
  seo: {
    // Site URL (required for sitemap, canonical URLs, and Open Graph)
    siteUrl: 'https://kimmandoo.vercel.app',
    
    // Google Analytics (GA4)
    // Get your Measurement ID from: https://analytics.google.com/
    googleAnalytics: {
      enabled: true,
      measurementId: 'G-B77D5GLJNH', // Format: 'G-XXXXXXXXXX'
    },
    
    // Google Search Console
    // Get verification code from: https://search.google.com/search-console
    googleSearchConsole: {
      enabled: true,
      verificationCode: 'k8VrbwUFnj8lxGHtc7y0pXF1UTDdVrz3sgsQdnwtFww', // Just the code, not the full meta tag
    },
    // Google AdSense
    // Get your client ID from: https://www.google.com/adsense/
    googleAdsense: {
      enabled: false,
      clientId: '', // Format: 'ca-pub-XXXXXXXXXX'
    },
    
    // Open Graph defaults
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: 'mandoo.log',
      // Default image for posts without an image (relative to public folder)
      defaultImage: 'https://avatars.githubusercontent.com/u/46841652?v=4',
    },
    
    // Twitter Card settings
    twitter: {
      card: 'summary_large_image',
      // Your Twitter handle (optional)
      site: '',
      creator: '',
    },
  },

  // Social Links
  socialLinks: {
    github: 'https://github.com/kimmandoo',
    linkedin: 'https://www.linkedin.com/in/mingyukim99/',
    medium: 'https://kimmandoo.medium.com/',
  },

  // RSS Feed configuration
  rss: {
    // Enable/disable RSS feed generation at /feed.xml
    enabled: true,
    // Maximum number of posts to include in feed (0 = all posts)
    maxItems: 50,
    // Cache duration in seconds (default: 1 hour)
    cacheMaxAge: 3600,
  },

  // Reading Progress Indicator configuration
  readingProgress: {
    // Enable/disable the reading progress features
    enabled: true,
    // Show the top progress bar
    showTopBar: true,
    // Show the floating circular indicator (bottom-right)
    showFloatingIndicator: true,
    // Scroll threshold (in pixels) before showing the floating indicator
    floatingIndicatorThreshold: 100,
    // Hide floating indicator when reading is complete (percentage)
    hideWhenCompleteThreshold: 99,
  },

  // UI Text (easily change language here)
  text: {
    categories: 'Categories',
    tags: 'Tags',
    filter: 'Filter:',
    noPostsFound: 'No posts found for the selected filter.',
    viewAllPosts: 'View all posts',
    comments: 'Comments',
    commentsSetupRequired: 'To enable comments, please',
    commentsSetupInConfig: 'complete the Giscus setup in',
    commentsSetupGuide: 'View Giscus setup guide',
    giscusNotConfigured: '⚠️ Giscus repository information is not configured.',
    giscusConfigInstructions: 'Please set repo, repoId, and categoryId in the configuration.',
    // Reading progress text
    readingProgress: {
      minutesRemaining: '분 남음', // "{X}분 남음" = "{X} minutes remaining"
      readingComplete: '읽기 완료!', // "Reading complete!"
      minutesRead: '분', // Used in "X/Y분" format
    },
  },
};

export type ThemeConfig = typeof themeConfig;
