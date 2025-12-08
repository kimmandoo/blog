# Theme Configuration Guide

Complete guide to customizing your blog's appearance, features, and settings.

## 📁 Configuration Files

### Main Configuration File

All theme settings are in `config/theme.config.ts`. This is where you customize:
- Site information (title, description, tagline)
- Colors and styling
- Typography and spacing
- Features (comments, analytics, RSS)
- SEO settings
- UI text (for internationalization)

### Template File (Reference)

A template configuration file is available at `config/theme.config.template.ts` with:
- All available options documented
- Detailed comments explaining each setting
- Example values for reference

**Use the template file as a reference when customizing your blog.**

## 🚀 Quick Customization Guide

### Essential Settings (Required After Forking)

These settings **must** be updated after forking:

#### 1. Site Information

```typescript
site: {
  title: 'Your Blog Name',           // Change to your blog name
  description: 'Your description',   // Change to your description
  tagline: 'Your tagline',          // Change to your tagline
}
```

#### 2. Site URL (Critical for SEO!)

```typescript
seo: {
  siteUrl: 'https://yourdomain.com',  // Change to YOUR actual domain
}
```

#### 3. Open Graph Settings

```typescript
seo: {
  openGraph: {
    locale: 'en_US',  // Change to your locale (en_US, ko_KR, ja_JP, etc.)
    siteName: 'Your Blog Name',  // Should match site.title
  }
}
```

#### 4. Social Links (Optional)

```typescript
socialLinks: {
  github: 'https://github.com/yourusername',  // Your GitHub
  linkedin: '',  // Remove or leave empty if not needed
  medium: '',    // Remove or leave empty if not needed
}
```

## 🎨 Styling Customization

### Configuration File

All theme settings are located in `config/theme.config.ts`. This file contains:

### Site Information
- `site.title`: Blog title
- `site.description`: Blog description for SEO
- `site.tagline`: Subtitle displayed on the home page

### Colors
Separate color schemes for light and dark modes:
- Background colors (primary, card, cardHover)
- Text colors (primary, secondary, tertiary)
- Border colors
- Accent colors and gradients

### Typography
- Font families for sans-serif and monospace text
- Font sizes for different text elements

### Spacing & Layout
- Container widths
- Post content width
- Section padding
- Card padding

### Visual Elements
- Border radius values
- Shadow styles
- Animation transitions

### Taxonomy (Categories & Tags)
- Category color palette (6 different colors that rotate)
- Tag styling (background, text, hover effects)

### Comments Configuration
- Enable/disable comments
- Giscus settings for GitHub Discussions-based comments

### SEO Configuration
- Site URL for sitemap and canonical URLs
- Google Analytics integration
- Google Search Console verification
- Google AdSense integration
- Open Graph metadata settings
- Twitter Card settings

### UI Text
- All user-facing text strings (categories, tags, filter labels, messages)
- Easy to change for different languages or customize wording

## 📝 Customization Examples

### Example 1: Changing Colors

Want a blue-themed blog instead of black/white?

```typescript
colors: {
  light: {
    background: {
      primary: 'from-blue-50 via-white to-blue-50',
    },
    accent: {
      primary: 'bg-blue-600 text-white',
      gradient: 'from-blue-600 via-blue-500 to-blue-600',
    },
  },
  dark: {
    background: {
      primary: 'dark:from-blue-950 dark:via-gray-900 dark:to-blue-950',
    },
    accent: {
      primary: 'dark:bg-blue-500 dark:text-white',
    },
  }
}
```

**Available Tailwind color options:**
- Blue: `blue-50`, `blue-100`, ..., `blue-900`, `blue-950`
- Green: `emerald-`, `green-`, `lime-`
- Purple: `purple-`, `violet-`, `indigo-`
- Red: `red-`, `rose-`, `pink-`
- Yellow: `yellow-`, `amber-`, `orange-`
- Gray: `gray-`, `slate-`, `zinc-`, `neutral-`, `stone-`

### Example 2: Changing Typography

Make text larger and use a different font:

```typescript
typography: {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',  // Use Inter font
  },
  fontSize: {
    title: 'text-5xl',      // Larger site title
    heading: 'text-3xl',    // Larger headings
    body: 'text-lg',        // Larger body text
  }
```

**Available Tailwind font size options:**
- Extra small: `text-xs`, `text-sm`
- Standard: `text-base`
- Large: `text-lg`, `text-xl`, `text-2xl`
- Extra large: `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`, `text-8xl`, `text-9xl`

### Example 3: Changing Post Content Width

Make posts wider for a more spacious layout:

```typescript
spacing: {
  container: 'max-w-5xl',     // Wider homepage container
  postWidth: 'max-w-5xl',     // Wider post content
  section: 'py-20',           // More vertical spacing
  card: 'p-8',                // More padding in cards
}
```

**Available max-width options:**
- Narrow: `max-w-lg` (32rem), `max-w-xl` (36rem)
- Standard: `max-w-2xl` (42rem), `max-w-3xl` (48rem), `max-w-4xl` (56rem)
- Wide: `max-w-5xl` (64rem), `max-w-6xl` (72rem), `max-w-7xl` (80rem)
- Full: `max-w-full` (100%)

### Example 4: Changing Post Body Text Size

Make post content larger and easier to read:

```typescript
prose: {
  // Base prose size: prose-sm, prose-base, prose-lg, prose-xl, prose-2xl
  size: 'prose-lg',           // Larger base text
  // Heading sizes within posts
  h1: 'text-4xl',
  h2: 'text-3xl',
  h3: 'text-2xl',
  // Paragraph text color
  paragraphColor: {
    light: 'text-gray-800',   // Darker text for better readability
    dark: 'text-gray-200',    // Lighter text in dark mode
  },
}
```

**Available prose size options:**
- `prose-sm` - Smaller, compact text
- `prose-base` - Standard size (default)
- `prose-lg` - Larger, more readable
- `prose-xl` - Extra large
- `prose-2xl` - Very large

### Example 5: Enabling Code Block Features

Add line numbers and copy buttons to code blocks:

```typescript
codeBlock: {
  showLineNumbers: true,      // Show line numbers on the left
  startLineNumber: 1,         // Start counting from 1
  showCopyButton: true,       // Show copy button on hover
  showLanguageBadge: true,    // Show language name badge
}
```

### Example 6: Customizing for Different Languages

Change all UI text to Korean:

```typescript
text: {
  categories: '카테고리',
  tags: '태그',
  filter: '필터:',
  noPostsFound: '선택한 필터에 대한 게시물이 없습니다.',
  viewAllPosts: '모든 게시물 보기',
  comments: '댓글',
  readingProgress: {
    minutesRemaining: '분 남음',
    readingComplete: '읽기 완료!',
    minutesRead: '분',
  }
}
```

Or Spanish:

```typescript
text: {
  categories: 'Categorías',
  tags: 'Etiquetas',
  filter: 'Filtrar:',
  noPostsFound: 'No se encontraron publicaciones para el filtro seleccionado.',
  viewAllPosts: 'Ver todas las publicaciones',
  comments: 'Comentarios',
}
```

### Example 7: Customizing Category Colors

Change the color palette for categories:

```typescript
taxonomy: {
  categories: {
    colors: [
      // Use your own color scheme
      'bg-gradient-to-r from-purple-500/90 to-purple-600/90 text-white',
      'bg-gradient-to-r from-green-500/90 to-green-600/90 text-white',
      'bg-gradient-to-r from-orange-500/90 to-orange-600/90 text-white',
      'bg-gradient-to-r from-pink-500/90 to-pink-600/90 text-white',
    ],
  },
}
```

## 🔧 Feature Configuration

### Setting Up Comments

To enable comments using Giscus:

1. Enable GitHub Discussions on your repository
2. Install the Giscus app: https://github.com/apps/giscus
3. Visit https://giscus.app/ko to generate your configuration
4. Update `config/theme.config.ts` with your settings:

```typescript
comments: {
  enabled: true,
  giscus: {
    repo: 'username/repo',
    repoId: 'your-repo-id',
    category: 'General',
    categoryId: 'your-category-id',
    // ... other settings
  },
}
```

## Categories and Tags

### Adding to Posts

In your markdown frontmatter:

```markdown
---
title: "Your Post Title"
date: "2025-01-15"
excerpt: "Post description"
category: "Tutorial"
tags: ["nextjs", "react", "web-development"]
---
```

### Category Colors

Categories automatically get assigned colors from the palette defined in `themeConfig.taxonomy.categories.colors`. The colors rotate based on the category index.

### Tag Styling

Tags are styled consistently with the hashtag prefix. Customize the appearance in `themeConfig.taxonomy.tags`.

## SEO Setup

### Site URL

Set your site URL for proper SEO:

```typescript
seo: {
  siteUrl: 'https://your-domain.com',
}
```

### Google Analytics

To enable Google Analytics:

1. Create a Google Analytics 4 property at https://analytics.google.com/
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Update the configuration:

```typescript
seo: {
  googleAnalytics: {
    enabled: true,
    measurementId: 'G-XXXXXXXXXX',
  },
}
```

### Google Search Console

To enable Google Search Console verification:

1. Go to https://search.google.com/search-console
2. Add your property and choose "HTML tag" verification
3. Copy the verification code (the `content` value from the meta tag)
4. Update the configuration:

```typescript
seo: {
  googleSearchConsole: {
    enabled: true,
    verificationCode: 'your-verification-code',
  },
}
```

### Google AdSense

To enable Google AdSense:

1. Create an AdSense account at https://www.google.com/adsense/
2. Get your client ID (format: `ca-pub-XXXXXXXXXX`)
3. Update the configuration:

```typescript
seo: {
  googleAdsense: {
    enabled: true,
    clientId: 'ca-pub-XXXXXXXXXX',
  },
}
```

### Open Graph Settings

Customize how your posts appear when shared on social media:

```typescript
seo: {
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Your Blog Name',
    defaultImage: '/images/og-default.png',
  },
}
```

### Twitter Card Settings

Customize how your posts appear on Twitter:

```typescript
seo: {
  twitter: {
    card: 'summary_large_image',
    site: '@yourtwitterhandle',
    creator: '@yourtwitterhandle',
  },
}
```

## Generated SEO Files

The blog automatically generates:

- `/sitemap.xml` - Contains all your posts for search engines
- `/robots.txt` - Tells search engines which pages to crawl
