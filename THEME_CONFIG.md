# Theme Configuration Guide

This blog now supports easy theme customization through a centralized configuration file.

## Configuration File

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

## How to Customize

1. Open `config/theme.config.ts`
2. Modify any values to match your desired design
3. The changes will be reflected throughout the blog

### Example: Changing Colors

```typescript
colors: {
  light: {
    background: {
      primary: 'from-blue-50 via-white to-blue-50', // Change gradient
    },
    accent: {
      primary: 'bg-blue-600 text-white', // Change accent color
    },
  },
}
```

### Example: Changing Typography

```typescript
typography: {
  fontSize: {
    title: 'text-7xl', // Make title larger
    body: 'text-base', // Make body text smaller
  },
}
```

### Example: Changing Post Content Width

```typescript
spacing: {
  container: 'max-w-4xl',
  postWidth: 'max-w-5xl', // Make post content wider (options: max-w-lg, max-w-xl, max-w-2xl, max-w-3xl, max-w-4xl, max-w-5xl, max-w-6xl, max-w-7xl, max-w-full)
  section: 'py-20',
  card: 'p-6',
}
```

### Example: Changing Post Body Text Size

```typescript
prose: {
  // Base prose size: prose-sm, prose-base, prose-lg, prose-xl, prose-2xl
  size: 'prose-xl', // Make post body text larger
  // Heading sizes
  h1: 'text-5xl',
  h2: 'text-4xl',
  h3: 'text-3xl',
  // Paragraph text color
  paragraphColor: {
    light: 'text-gray-800',
    dark: 'text-gray-200',
  },
}
```

### Example: Changing Code Block Settings

```typescript
codeBlock: {
  showLineNumbers: true, // Show line numbers
  showCopyButton: true,  // Show copy button
  showLanguageBadge: true, // Show language badge
}
```

### Example: Changing Language

```typescript
text: {
  categories: 'Categories',
  tags: 'Tags',
  filter: 'Filter:',
  noPostsFound: 'No posts found for the selected filter.',
  viewAllPosts: 'View All Posts',
  comments: 'Comments',
  // ... other text strings
}
```

## Setting Up Comments

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
