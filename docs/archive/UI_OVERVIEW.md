# AndroidCS Feature - UI/UX Overview

## Page Structure

### 1. Navigation Menu (All Pages)
```
┌─────────────────────────────────────────────────────┐
│              mandoo.log                              │
│            발버둥치는 중                                │
│                                                       │
│         [ Blog ]    [ AndroidCS ]                    │
│         (active)     (inactive)                      │
└─────────────────────────────────────────────────────┘
```

### 2. AndroidCS List Page (`/androidcs`)
```
┌─────────────────────────────────────────────────────┐
│              mandoo.log                              │
│            발버둥치는 중                                │
│                                                       │
│         [ Blog ]    [ AndroidCS ]                    │
│        (inactive)     (active)                       │
│                                                       │
│  안드로이드 CS 지식                                     │
│  안드로이드 개발에 필요한 CS 지식을 위키 형식으로         │
│  정리했습니다.                                          │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ 안드로이드 샘플 문서         2024.01.01      │   │
│  │ 안드로이드 CS 지식 샘플 문서입니다.           │   │
│  │ Android #android #sample                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ [More documents would appear here...]        │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 3. AndroidCS Document Page (`/androidcs/sample`)
```
┌─────────────────────────────────────────────────────┐
│  ← Back to AndroidCS                                 │
│                                                       │
│  2024.01.01 · 1 min read                            │
│  Android                                             │
│                                                       │
│  안드로이드 샘플 문서                                   │
│  안드로이드 CS 지식 샘플 문서입니다.                     │
│  #android #sample                                    │
│                                                       │
│  ─────────────────────────────────────              │
│                                                       │
│  # 안드로이드 CS 지식                                  │
│                                                       │
│  이것은 안드로이드 CS 지식을 정리하는 샘플             │
│  문서입니다.                                           │
│                                                       │
│  ## 개요                                              │
│                                                       │
│  안드로이드 개발에 필요한 CS 지식을 정리합니다.          │
│                                                       │
│  ## 주요 내용                                          │
│                                                       │
│  - 안드로이드 아키텍처                                  │
│  - 생명주기                                            │
│  - 메모리 관리                                         │
│                                                       │
│  ─────────────────────────────────────              │
│                                                       │
│            ← Back to AndroidCS                       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Key UI Features

### Navigation Menu
- **Appearance**: Centered tabs with rounded corners
- **Active State**: Black background with white text (light mode)
- **Inactive State**: Gray text with hover effect
- **Position**: Below site title and tagline

### AndroidCS List Page
- **Layout**: Clean vertical list of documents
- **Card Style**: Bordered cards with hover effects
- **Content Display**:
  - Title (large, bold)
  - Excerpt (smaller, gray)
  - Category badge (rounded pill)
  - Tags (prefixed with #)
  - Date (top-right corner)

### AndroidCS Document Page
- **Header Section**:
  - Back navigation button with arrow
  - Metadata (date, reading time, category)
  - Title (large, bold)
  - Excerpt
  - Tags
- **Content Section**:
  - Full markdown rendering
  - Syntax-highlighted code blocks
  - Math equations support
  - Mermaid diagrams support
- **Footer Section**:
  - Back to AndroidCS button

### Responsive Design
- **Desktop**: Full navigation visible, optimal spacing
- **Tablet**: Adjusted layout, maintains functionality
- **Mobile**: Stacked layout, touch-friendly buttons

### Dark Mode Support
- Automatically switches based on system preference
- All components have dark mode variants
- Maintains readability in both modes

## Color Scheme

### Light Mode
- Background: White with gray gradient
- Text: Black primary, gray secondary
- Accents: Black buttons, gray borders
- Cards: White with light border

### Dark Mode
- Background: Black with dark gray gradient
- Text: White primary, light gray secondary
- Accents: White buttons, dark gray borders
- Cards: Dark gray with darker border

## Interaction States

### Hover Effects
- Navigation tabs: Color change
- Document cards: Border color change, background tint
- Links: Underline appears

### Active States
- Navigation: Highlighted tab with contrasting background
- Current route indication

### Transitions
- All state changes: Smooth 200ms transitions
- Maintains performance
