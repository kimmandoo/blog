# AndroidCS Content Organization Guide

## 📁 Folder Structure

The AndroidCS section uses a well-organized folder structure to separate content and assets:

```
android-cs/
├── posts/          # 📝 All markdown posts go here
│   ├── android/    # Posts organized by category
│   │   ├── activity-lifecycle.md
│   │   └── fragments.md
│   ├── architecture/
│   │   ├── mvvm.md
│   │   └── clean-architecture.md
│   └── performance/
│       └── memory-optimization.md
│
└── images/         # 🖼️ All images go here
    ├── android/    # Images organized by category (matching posts)
    │   ├── activity-diagram.png
    │   └── fragment-lifecycle.png
    ├── architecture/
    │   └── mvvm-pattern.png
    └── performance/
        └── memory-graph.png
```

## 🎯 Key Features

### 1. Separated Content
- **Posts Directory**: All markdown files go in `android-cs/posts/`
- **Images Directory**: All images go in `android-cs/images/`
- Clean separation makes content management easier

### 2. Nested Categories Support
- Create subdirectories for different categories
- Unlimited nesting depth supported
- Automatic category detection from folder structure

### 3. Relative Image Paths
Images can be referenced relative to the posts directory:
```markdown
<!-- From android-cs/posts/android/activity-lifecycle.md -->
![Activity Lifecycle](../../images/android/activity-diagram.png)

<!-- Or use absolute path from site root -->
![Activity Lifecycle](/images/android/activity-diagram.png)
```

## 📝 Creating New Posts

### Basic Post Structure

1. Create a markdown file in `android-cs/posts/` or any subdirectory:

```bash
# Flat structure (root level)
android-cs/posts/my-post.md

# Nested structure (recommended)
android-cs/posts/android/my-post.md
android-cs/posts/architecture/design-patterns/singleton.md
```

2. Add frontmatter to your markdown file:

```markdown
---
title: 액티비티 생명주기
date: 2024-01-15
excerpt: 안드로이드 액티비티의 생명주기에 대한 상세 설명
category: Android
tags: [android, activity, lifecycle]
draft: false
---

# 액티비티 생명주기

Your content here...
```

### Post Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title |
| `date` | string | Yes | Publication date (YYYY-MM-DD) |
| `excerpt` | string | No | Short description |
| `category` | string | No | Category for grouping in sidebar |
| `tags` | array | No | Tags for the post |
| `draft` | boolean | No | Set to true to hide from production |

## 🖼️ Managing Images

### Image Organization

1. Store images in `android-cs/images/` directory
2. Organize by category matching your posts structure:

```
android-cs/images/
├── android/
├── architecture/
└── shared/  # Common images used across multiple posts
```

### Using Images in Posts

**Option 1: Relative Path**
```markdown
![Description](../../images/category/image.png)
```

**Option 2: Absolute Path**
```markdown
![Description](/android-cs/images/category/image.png)
```

**Option 3: With Size Control**
```markdown
<img src="../../images/category/image.png" alt="Description" width="600" />
```

## 📂 Example: Creating a New Category

Let's create a new "Performance" category:

### 1. Create folder structure:
```bash
mkdir -p android-cs/posts/performance
mkdir -p android-cs/images/performance
```

### 2. Add a post:
```bash
# Create: android-cs/posts/performance/memory-optimization.md
```

```markdown
---
title: 메모리 최적화 기법
date: 2024-02-01
excerpt: 안드로이드 앱의 메모리 사용을 최적화하는 방법
category: Performance
tags: [android, performance, memory]
---

# 메모리 최적화 기법

![Memory Graph](../../images/performance/memory-graph.png)

## 개요
...
```

### 3. Add images:
```bash
# Copy your image to:
android-cs/images/performance/memory-graph.png
```

### 4. Result:
- Post appears in sidebar under "Performance" category
- URL: `/androidcs/performance/memory-optimization`
- Images load correctly with relative paths

## 🔍 How It Works

### Automatic Discovery
The system automatically:
1. Scans `android-cs/posts/` directory recursively
2. Finds all `.md` files (ignores `images` directory)
3. Generates slugs from folder structure:
   - `posts/android/activity.md` → slug: `android/activity`
   - `posts/arch/mvvm.md` → slug: `arch/mvvm`

### Category Grouping
- Categories are taken from the `category` frontmatter field
- Posts with same category are grouped in sidebar
- If no category specified, grouped under "기타" (Others)

### Image Handling
- Images directory is completely separate from posts
- No risk of accidentally including images in post lists
- Supports any image format (png, jpg, gif, svg, etc.)

## 🚀 Migration from Old Structure

If you have existing posts in the root `android-cs/` directory:

```bash
# Move existing posts
mkdir -p android-cs/posts
mv android-cs/*.md android-cs/posts/

# Create images directory
mkdir -p android-cs/images

# Move any images
mv android-cs/*.png android-cs/images/
mv android-cs/*.jpg android-cs/images/
```

The system automatically detects and supports both:
- New structure: `android-cs/posts/`
- Old structure: `android-cs/` (fallback)

## 📊 Best Practices

### 1. Consistent Naming
```
✅ Good:
- activity-lifecycle.md
- memory-optimization.md
- clean-architecture.md

❌ Avoid:
- Activity Lifecycle.md (spaces)
- 액티비티.md (non-ASCII in filename)
```

### 2. Logical Categories
```
✅ Good structure:
android-cs/posts/
├── android/        # Platform-specific
├── architecture/   # Design patterns
├── performance/    # Optimization
└── security/       # Security topics

❌ Avoid deep nesting:
android-cs/posts/android/components/activities/lifecycle/onCreate.md
```

### 3. Image Optimization
- Compress images before uploading
- Use descriptive filenames
- Consider using WebP format for better performance

### 4. Frontmatter Consistency
- Always include `title`, `date`, and `category`
- Use consistent date format: `YYYY-MM-DD`
- Use lowercase tags for consistency

## 🔧 Troubleshooting

### Post not appearing?
- Check if `draft: true` is set in frontmatter
- Verify file has `.md` extension
- Ensure file is in `android-cs/posts/` directory

### Images not loading?
- Check image path is correct
- Verify image is in `android-cs/images/` directory
- Try using absolute path: `/android-cs/images/...`

### Category not showing in sidebar?
- Check `category` field in frontmatter
- Ensure category name is spelled consistently
- Rebuild the site to refresh categories

## 📚 Additional Resources

- See `ANDROIDCS_GUIDE.md` for basic usage
- See `GITBOOK_STYLE.md` for styling details
- See sample post in `android-cs/posts/sample.md`
