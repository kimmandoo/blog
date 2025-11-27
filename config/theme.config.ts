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
        primary: 'from-slate-50 via-white to-blue-50',
        card: 'bg-white/80 backdrop-blur-sm',
        cardHover: 'hover:border-indigo-200 hover:shadow-indigo-100/50',
      },
      text: {
        primary: 'text-slate-900',
        secondary: 'text-slate-600',
        tertiary: 'text-slate-500',
      },
      border: {
        primary: 'border-slate-200/60',
        secondary: 'border-slate-200',
      },
      accent: {
        primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
        gradient: 'from-indigo-600 via-purple-600 to-pink-500',
      },
      code: {
        background: 'bg-slate-100',
        text: 'text-slate-800',
      },
    },
    // Dark mode colors
    dark: {
      background: {
        primary: 'dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950',
        card: 'dark:bg-slate-800/80 dark:backdrop-blur-sm',
        cardHover: 'dark:hover:border-indigo-500/50 dark:hover:shadow-indigo-500/10',
      },
      text: {
        primary: 'dark:text-white',
        secondary: 'dark:text-slate-300',
        tertiary: 'dark:text-slate-400',
      },
      border: {
        primary: 'dark:border-slate-700/60',
        secondary: 'dark:border-slate-700',
      },
      accent: {
        primary: 'dark:bg-gradient-to-r dark:from-indigo-500 dark:to-purple-500 dark:text-white',
        gradient: 'dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400',
      },
      code: {
        background: 'dark:bg-slate-700',
        text: 'dark:text-slate-200',
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
    card: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-indigo-200/30 dark:hover:shadow-indigo-500/10',
    button: 'shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40',
  },

  // Animations
  animations: {
    transition: 'transition-all duration-300 ease-out',
    hover: 'hover:-translate-y-1.5',
    scale: 'hover:scale-[1.02]',
  },

  // Category and Tag settings
  taxonomy: {
    categories: {
      colors: [
        'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50',
        'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/50 dark:to-green-900/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50',
        'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/50 dark:to-violet-900/50 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50',
        'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 dark:from-pink-900/50 dark:to-rose-900/50 dark:text-pink-300 border border-pink-200/50 dark:border-pink-700/50',
        'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/50 dark:to-yellow-900/50 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50',
        'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 dark:from-indigo-900/50 dark:to-blue-900/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50',
      ],
    },
    tags: {
      style: 'bg-slate-100/80 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600/50',
      hoverStyle: 'hover:bg-slate-200/80 dark:hover:bg-slate-600/50 hover:border-slate-300 dark:hover:border-slate-500',
    },
  },

  // Code block configuration
  codeBlock: {
    // Enable/disable line numbers
    showLineNumbers: false,
    // Starting line number (usually 1)
    startLineNumber: 1,
    // Show copy button on hover
    showCopyButton: false,
    // Show language badge
    showLanguageBadge: false,
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
      enabled: false,
      measurementId: '', // Format: 'G-XXXXXXXXXX'
    },
    
    // Google Search Console
    // Get verification code from: https://search.google.com/search-console
    googleSearchConsole: {
      enabled: false,
      verificationCode: '', // Just the code, not the full meta tag
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
  },
};

export type ThemeConfig = typeof themeConfig;
