# GitBook-Style AndroidCS Documentation

## Overview
The AndroidCS section has been transformed into a GitBook-style documentation platform with sidebar navigation, breadcrumb trails, and integrated comments on each page.

## Key Features

### 1. GitBook-Style Layout

#### Three-Column Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (Sticky)                                         │
│ [mandoo.log]  [Blog] [AndroidCS]                                   │
└─────────────────────────────────────────────────────────────────────┘
┌──────────────┬────────────────────────────────┬─────────────────────┐
│   Sidebar    │      Main Content              │   On This Page     │
│  (280px)     │       (Flexible)               │     (256px)        │
│              │                                │                     │
│ 📍 홈        │  Breadcrumb Navigation         │  Table of          │
│              │  AndroidCS > Android > Title   │  Contents          │
│ 📂 Android   │                                │                     │
│  📄 샘플문서  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  • 안드로이드      │
│              │                                │    CS 지식          │
│ 📂 기타      │  📝 Document Title             │  • 개요            │
│  📄 ...      │                                │  • 주요 내용       │
│              │  Metadata (date, reading time) │                     │
│              │  Tags                          │                     │
│              │                                │                     │
│              │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │                     │
│              │                                │                     │
│              │  📖 Content                    │                     │
│              │     Markdown rendered with     │                     │
│              │     syntax highlighting        │                     │
│              │                                │                     │
│              │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │                     │
│              │                                │                     │
│              │  💬 Comments (Giscus)          │                     │
│              │     Comment section below      │                     │
│              │     document content           │                     │
└──────────────┴────────────────────────────────┴─────────────────────┘
```

### 2. Navigation Components

#### Top Navigation Bar (Sticky)
- Fixed at top of page
- Contains site logo and Blog/AndroidCS navigation tabs
- White background with subtle border
- Stays visible while scrolling

#### Left Sidebar
- **Desktop**: Always visible, fixed width (280px)
- **Mobile**: Collapsible with floating button
- **Organization**: Documents grouped by category
- **Features**:
  - Home link with icon
  - Category headings (uppercase, small text)
  - Document links with file icons
  - Active state highlighting (blue background)
  - Hover effects on all links

#### Right Sidebar (Desktop Only)
- **Width**: 256px
- **Content**: "On This Page" mini table of contents
- **Behavior**: Sticky, scrolls with page
- **Hidden**: On tablets and mobile devices

### 3. Document Page Features

#### Breadcrumb Navigation
```
AndroidCS > Android > 안드로이드 샘플 문서
```
- Shows document hierarchy
- Clickable links to parent pages
- Located above document title

#### Document Header
- **Title**: Large, bold (4xl on mobile, 5xl on desktop)
- **Excerpt**: Larger text, gray color
- **Metadata Icons**:
  - 📅 Calendar icon for date (e.g., "2024년 01월 01일")
  - ⏱️ Clock icon for reading time (e.g., "1분 읽기")
- **Tags**: Rounded pills with gray background

#### Content Styling
- **Links**: Blue color (#2563eb) with underline on hover
- **Code**: Pink inline code with gray background
- **Blockquotes**: Blue left border with light blue background
- **Images**: Rounded corners with border
- **Headers**: Bold, black text with bottom border for H2

#### Comments Section
- **Position**: Below document content, after border separator
- **Component**: Giscus comments integration
- **Features**:
  - GitHub Discussions-based comments
  - Dark/light mode support
  - Reactions and threading
  - Markdown support in comments

### 4. Mobile Responsiveness

#### Mobile View (<1024px)
```
┌─────────────────────────────────┐
│ Top Navigation Bar              │
│ [mandoo.log]  [Blog] [AndroidCS]│
└─────────────────────────────────┘
┌─────────────────────────────────┐
│                                 │
│  Main Content (Full Width)      │
│                                 │
│  • Sidebar hidden by default    │
│  • Floating toggle button       │
│    (bottom-left, blue circle)   │
│  • ToC hidden                   │
│                                 │
└─────────────────────────────────┘

[🔵] ← Sidebar Toggle Button
```

#### Tablet View (1024px - 1280px)
- Sidebar visible
- ToC hidden
- Content takes remaining space

#### Desktop View (>1280px)
- All three columns visible
- Optimal reading experience
- ToC fixed on right

### 5. Color Scheme

#### Light Mode
- **Background**: Pure white (#ffffff)
- **Text**: Black primary, gray secondary
- **Accent**: Blue (#2563eb)
- **Borders**: Light gray (#e5e7eb)
- **Sidebar Active**: Blue background with blue text
- **Hover**: Light gray background

#### Dark Mode
- **Background**: Near black (#030712)
- **Text**: White primary, light gray secondary
- **Accent**: Blue (#3b82f6)
- **Borders**: Dark gray (#1f2937)
- **Sidebar Active**: Dark blue with light blue text
- **Hover**: Dark gray background

### 6. Category Organization

Documents are automatically grouped by their `category` field:
- Each category gets its own section in sidebar
- Categories displayed in uppercase with tracking
- Documents listed under their category
- If no category specified, grouped under "기타" (Others)

### 7. Interactive Elements

#### Hover States
- **Links**: Underline appears
- **Sidebar Items**: Background color change
- **Cards**: Border color changes to blue, shadow appears
- **Buttons**: Opacity changes

#### Active States
- **Current Page**: Blue background in sidebar
- **Navigation Tab**: Blue background with rounded corners

#### Transitions
- All state changes: Smooth 200-300ms transitions
- Sidebar slide-in: 300ms ease

## Implementation Details

### Components Created
1. **AndroidCSSidebar**: Left sidebar navigation with category grouping
2. **Updated AndroidCS pages**: GitBook-style layout integration

### Styling Approach
- Tailwind CSS utility classes
- Responsive breakpoints (lg, xl)
- Dark mode with `dark:` prefix
- Hover states with `hover:` prefix
- Group hover with `group-hover:` prefix

### Comments Integration
- Uses existing Giscus component from theme config
- Configured via `theme.config.ts`
- Supports reactions, threading, and markdown
- Dark/light mode automatic switching

## User Experience Improvements

1. **Better Navigation**: Sidebar makes finding documents easier
2. **Context Awareness**: Breadcrumbs show current location
3. **Quick Navigation**: ToC for jumping to sections
4. **Interactive**: Comments allow discussion on documents
5. **Mobile-Friendly**: Responsive design works on all devices
6. **Professional**: Clean, documentation-focused aesthetic

## Comparison: Before vs After

### Before (Wiki Style)
- Simple list of documents
- No navigation structure
- No comments
- Centered layout
- Gradient background

### After (GitBook Style)
- Sidebar with category organization
- Breadcrumb navigation
- Comments on each document
- Three-column layout
- Clean white background
- Professional documentation aesthetic
