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

  // Color scheme - Simple & Modern
  colors: {
    // Light mode colors
    light: {
      background: {
        primary: 'from-stone-50 to-stone-100',
        card: 'bg-white',
        cardHover: 'hover:bg-stone-50',
      },
      text: {
        primary: 'text-stone-900',
        secondary: 'text-stone-600',
        tertiary: 'text-stone-400',
      },
      border: {
        primary: 'border-stone-200',
        secondary: 'border-stone-300',
      },
      accent: {
        primary: 'bg-stone-900 text-white',
        gradient: 'from-stone-800 to-stone-900',
      },
      code: {
        background: 'bg-stone-100',
        text: 'text-stone-800',
      },
    },
    // Dark mode colors
    dark: {
      background: {
        primary: 'dark:from-stone-950 dark:to-stone-900',
        card: 'dark:bg-stone-900/50',
        cardHover: 'dark:hover:bg-stone-800/50',
      },
      text: {
        primary: 'dark:text-stone-100',
        secondary: 'dark:text-stone-400',
        tertiary: 'dark:text-stone-500',
      },
      border: {
        primary: 'dark:border-stone-800',
        secondary: 'dark:border-stone-700',
      },
      accent: {
        primary: 'dark:bg-stone-100 dark:text-stone-900',
        gradient: 'dark:from-stone-100 dark:to-stone-200',
      },
      code: {
        background: 'dark:bg-stone-800',
        text: 'dark:text-stone-200',
      },
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      title: 'text-2xl',
      heading: 'text-xl',
      subheading: 'text-lg',
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
    h1: 'text-2xl',
    h2: 'text-xl',
    h3: 'text-lg',
    // Paragraph text color: text-gray-600, text-gray-700, text-gray-800, etc.
    paragraphColor: {
      light: 'text-stone-600',
      dark: 'text-stone-300',
    },
    // List text color
    listColor: {
      light: 'text-stone-600',
      dark: 'text-stone-300',
    },
  },

  // Spacing
  spacing: {
    container: 'max-w-2xl',
    section: 'py-16',
    card: 'p-6',
  },

  // Border radius
  borderRadius: {
    card: 'rounded-lg',
    button: 'rounded-md',
    image: 'rounded-lg',
  },

  // Shadows
  shadows: {
    card: 'shadow-none hover:shadow-sm',
    button: 'shadow-sm hover:shadow-md',
  },

  // Animations
  animations: {
    transition: 'transition-all duration-200 ease-out',
    hover: '',
    scale: '',
  },

  // Category and Tag settings - Simple flat colors
  taxonomy: {
    categories: {
      colors: [
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
        'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
        'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
        'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      ],
    },
    tags: {
      style: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
      hoverStyle: 'hover:bg-stone-200 hover:text-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-200',
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
