/**
 * Theme Configuration Template
 * 
 * Copy this file to config/theme.config.ts and customize it with your settings.
 * This template includes all available options with descriptions and examples.
 */

export const themeConfig = {
  // ============================================================================
  // SITE INFORMATION (Required - Update these first!)
  // ============================================================================
  site: {
    title: 'Your Blog Name',                    // Your blog's name
    description: 'Your blog description',       // Brief description (for SEO)
    tagline: 'Your tagline or subtitle',        // Subtitle shown on homepage
  },

  // ============================================================================
  // COLOR SCHEME
  // ============================================================================
  colors: {
    // Light mode colors
    light: {
      background: {
        // Main page background gradient
        primary: 'from-white via-gray-50 to-gray-100',
        // Card background color
        card: 'bg-white',
        // Card hover border color
        cardHover: 'hover:border-gray-300',
      },
      text: {
        // Main text color
        primary: 'text-black',
        // Secondary text (descriptions, metadata)
        secondary: 'text-gray-600',
        // Tertiary text (very subtle)
        tertiary: 'text-gray-500',
      },
      border: {
        primary: 'border-gray-100',
        secondary: 'border-gray-200',
      },
      accent: {
        // Accent color for buttons, links, etc.
        primary: 'bg-black text-white',
        // Accent gradient
        gradient: 'from-black via-gray-700 to-black',
      },
      code: {
        // Inline code background
        background: 'bg-gray-100',
        // Inline code text color
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

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Courier New", Courier, monospace',
    },
    fontSize: {
      title: 'text-3xl',      // Site title size
      heading: 'text-2xl',    // Page heading size
      subheading: 'text-xl',  // Subheading size
      body: 'text-base',      // Body text size
      small: 'text-sm',       // Small text (metadata, etc.)
    },
  },

  // ============================================================================
  // POST CONTENT STYLING (Prose configuration)
  // ============================================================================
  prose: {
    // Base prose size: prose-sm, prose-base, prose-lg, prose-xl, prose-2xl
    size: 'prose-base',
    // Heading sizes (within post content)
    h1: 'text-3xl',
    h2: 'text-2xl',
    h3: 'text-xl',
    h4: 'text-lg',
    // Paragraph text colors
    paragraphColor: {
      light: 'text-gray-700',
      dark: 'text-gray-300',
    },
    // List text colors
    listColor: {
      light: 'text-gray-700',
      dark: 'text-gray-300',
    },
  },

  // ============================================================================
  // SPACING AND LAYOUT
  // ============================================================================
  spacing: {
    // Max width of main container (max-w-2xl, max-w-3xl, max-w-4xl, max-w-5xl, etc.)
    container: 'max-w-4xl',
    // Max width of post content
    postWidth: 'max-w-4xl',
    // Section vertical padding
    section: 'py-16',
    // Card padding
    card: 'p-6',
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  borderRadius: {
    card: 'rounded-none',    // Card corners (rounded-none, rounded-lg, rounded-xl)
    button: 'rounded-full',  // Button corners
    image: 'rounded-lg',     // Image corners
  },

  // ============================================================================
  // SHADOWS
  // ============================================================================
  shadows: {
    card: '',                              // Card shadow (empty for no shadow)
    button: 'shadow-lg hover:shadow-2xl', // Button shadow
  },

  // ============================================================================
  // ANIMATIONS
  // ============================================================================
  animations: {
    transition: 'transition-all duration-200',
    hover: '',
    scale: 'hover:scale-105',
  },

  // ============================================================================
  // CATEGORIES AND TAGS
  // ============================================================================
  taxonomy: {
    categories: {
      // Array of gradient colors for categories (rotates through these)
      colors: [
        'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white dark:from-blue-400/90 dark:to-blue-500/90 dark:text-white',
        'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 text-white dark:from-emerald-400/90 dark:to-emerald-500/90 dark:text-white',
        'bg-gradient-to-r from-violet-500/90 to-violet-600/90 text-white dark:from-violet-400/90 dark:to-violet-500/90 dark:text-white',
        'bg-gradient-to-r from-rose-500/90 to-rose-600/90 text-white dark:from-rose-400/90 dark:to-rose-500/90 dark:text-white',
        'bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white dark:from-amber-400/90 dark:to-amber-500/90 dark:text-white',
      ],
    },
    tags: {
      // Tag styling
      style: 'bg-white/90 text-gray-800 dark:bg-gray-800/90 dark:text-gray-100',
      hoverStyle: 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-white hover:text-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800 dark:hover:text-white',
    },
  },

  // ============================================================================
  // CODE BLOCKS
  // ============================================================================
  codeBlock: {
    showLineNumbers: false,      // Show line numbers in code blocks
    startLineNumber: 1,          // Starting line number
    showCopyButton: false,       // Show copy button on hover
    showLanguageBadge: false,    // Show language badge (e.g., "JavaScript")
    colors: {
      background: 'linear-gradient(135deg, #1e1e2e 0%, #181825 100%)',
      text: '#e6e6e6',
      lineNumber: '#6c7086',
      lineNumberBackground: 'rgba(0, 0, 0, 0.2)',
      border: 'rgba(255, 255, 255, 0.1)',
      copyButton: {
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.15)',
        text: '#e6e6e6',
        hoverBackground: 'rgba(255, 255, 255, 0.12)',
        copiedBackground: 'rgba(16, 185, 129, 0.15)',
        copiedBorder: 'rgba(16, 185, 129, 0.3)',
        copiedText: '#10b981',
      },
      languageBadge: {
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.1)',
        text: '#888',
      },
    },
    borderRadius: '0.75rem',
    padding: '0.5em',
  },

  // ============================================================================
  // INLINE CODE
  // ============================================================================
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
    borderRadius: '0.375rem',
    paddingX: '0.4em',
    paddingY: '0.2em',
    fontSize: '0.9em',
  },

  // ============================================================================
  // COMMENTS (Giscus - GitHub Discussions)
  // ============================================================================
  comments: {
    enabled: false,  // Set to true to enable comments
    giscus: {
      // Your GitHub repository (format: 'username/repo')
      repo: 'yourusername/your-repo',
      // Get these values from https://giscus.app
      repoId: 'YOUR_REPO_ID',
      category: 'General',
      categoryId: 'YOUR_CATEGORY_ID',
      // How to map pages to discussions
      mapping: 'pathname',  // Options: pathname, url, title, og:title
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'top',  // Options: top, bottom
      theme: 'preferred_color_scheme',  // Auto dark/light mode
      lang: 'en',  // Language: en, ko, ja, zh-CN, etc.
    },
  },

  // ============================================================================
  // SEO CONFIGURATION (Important - Update these!)
  // ============================================================================
  seo: {
    // Your site URL (required for sitemap, canonical URLs, Open Graph)
    siteUrl: 'https://yourdomain.com',
    
    // Google Analytics (GA4)
    googleAnalytics: {
      enabled: false,  // Set to true to enable
      measurementId: 'G-XXXXXXXXXX',  // Get from https://analytics.google.com/
    },
    
    // Google Search Console verification
    googleSearchConsole: {
      enabled: false,  // Set to true to enable
      verificationCode: '',  // Get from https://search.google.com/search-console
    },
    
    // Google AdSense (optional)
    googleAdsense: {
      enabled: false,
      clientId: '',  // Format: 'ca-pub-XXXXXXXXXX'
    },
    
    // Open Graph (social media sharing)
    openGraph: {
      type: 'website',
      locale: 'en_US',  // Options: en_US, ko_KR, ja_JP, zh_CN, etc.
      siteName: 'Your Blog Name',
      // Default image for social sharing (if post doesn't have one)
      defaultImage: '/images/og-default.jpg',
    },
    
    // Twitter Card settings
    twitter: {
      card: 'summary_large_image',
      site: '',     // Your Twitter handle (optional): '@username'
      creator: '',  // Your Twitter handle (optional): '@username'
    },
  },

  // ============================================================================
  // SOCIAL LINKS (Optional - Remove or leave empty if not needed)
  // ============================================================================
  socialLinks: {
    github: '',     // Your GitHub profile URL
    linkedin: '',   // Your LinkedIn profile URL
    medium: '',     // Your Medium profile URL
  },

  // ============================================================================
  // RSS FEED
  // ============================================================================
  rss: {
    enabled: true,      // Enable RSS feed at /feed.xml
    maxItems: 50,       // Maximum posts in feed (0 = all posts)
    cacheMaxAge: 3600,  // Cache duration in seconds (3600 = 1 hour)
  },

  // ============================================================================
  // READING PROGRESS INDICATOR
  // ============================================================================
  readingProgress: {
    enabled: true,                  // Enable reading progress features
    showTopBar: true,               // Show thin progress bar at top
    showFloatingIndicator: true,    // Show circular indicator (bottom-right)
    floatingIndicatorThreshold: 100, // Show after scrolling X pixels
    hideWhenCompleteThreshold: 99,  // Hide when X% complete
  },

  // ============================================================================
  // UI TEXT (Customize for different languages)
  // ============================================================================
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
      minutesRemaining: 'min remaining',  // "{X} min remaining"
      readingComplete: 'Reading complete!',
      minutesRead: 'min',  // Used in "X/Y min" format
    },
  },
};

export type ThemeConfig = typeof themeConfig;
