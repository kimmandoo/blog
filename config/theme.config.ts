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
