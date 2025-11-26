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
