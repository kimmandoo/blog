# AndroidCS Content Organization - Quick Examples

## 📝 Example 1: Simple Post

### Create a post in root posts directory:
```bash
# File: android-cs/posts/kotlin-basics.md
```

```markdown
---
title: 코틀린 기초
date: 2024-03-01
category: Kotlin
tags: [kotlin, basics]
---

# 코틀린 기초

코틀린의 기본 문법을 알아봅니다.
```

**Result:**
- URL: `/androidcs/kotlin-basics`
- Appears in sidebar under "Kotlin" category

---

## 📂 Example 2: Nested Post with Category

### Create a post in category folder:
```bash
# File: android-cs/posts/android/activity-lifecycle.md
```

```markdown
---
title: 액티비티 생명주기
date: 2024-03-05
category: Android
tags: [android, activity]
---

# 액티비티 생명주기

액티비티의 생명주기에 대해 알아봅니다.
```

**Result:**
- URL: `/androidcs/android/activity-lifecycle`
- Appears in sidebar under "Android" category
- Slug includes folder structure

---

## 🖼️ Example 3: Post with Images

### 1. Create post:
```bash
# File: android-cs/posts/architecture/mvvm.md
```

```markdown
---
title: MVVM 패턴
date: 2024-03-10
category: Architecture
tags: [architecture, mvvm]
---

# MVVM 패턴

![MVVM Diagram](../../images/architecture/mvvm-diagram.png)

MVVM 아키텍처 패턴을 알아봅니다.
```

### 2. Add image:
```bash
# File: android-cs/images/architecture/mvvm-diagram.png
```

**Result:**
- Post shows with image
- Image path resolves correctly
- Clean organization with separate image storage

---

## 🗂️ Example 4: Deep Nesting

### Create deeply nested post:
```bash
# File: android-cs/posts/jetpack/compose/layouts/column.md
```

```markdown
---
title: Column 레이아웃
date: 2024-03-15
category: Jetpack Compose
tags: [compose, layout]
---

# Column 레이아웃

![Column Example](../../../../images/jetpack/compose/column.png)

Column 레이아웃 사용법을 알아봅니다.
```

**Result:**
- URL: `/androidcs/jetpack/compose/layouts/column`
- Full folder structure preserved in URL
- Breadcrumb: AndroidCS > Jetpack Compose > Column 레이아웃

---

## 🎯 Example 5: Complete Category Setup

### Setting up a new "Performance" category:

```bash
# 1. Create directories
mkdir -p android-cs/posts/performance
mkdir -p android-cs/images/performance

# 2. Create posts
touch android-cs/posts/performance/memory-optimization.md
touch android-cs/posts/performance/battery-optimization.md
touch android-cs/posts/performance/network-optimization.md

# 3. Add images
cp my-images/*.png android-cs/images/performance/
```

### Post example:
```markdown
---
title: 메모리 최적화
date: 2024-03-20
category: Performance
tags: [performance, memory]
---

# 메모리 최적화

![Memory Chart](../../images/performance/memory-chart.png)

앱의 메모리 사용을 최적화하는 방법을 알아봅니다.

## 주요 기법

![Optimization Techniques](../../images/performance/techniques.png)

1. 불필요한 객체 생성 방지
2. 메모리 누수 방지
3. 적절한 데이터 구조 선택
```

**Result:**
- All three posts appear in sidebar under "Performance" category
- Images load correctly
- Clean organization

---

## 📊 Folder Structure Examples

### Example A: Simple Structure
```
android-cs/
├── posts/
│   ├── intro.md
│   ├── basics.md
│   └── advanced.md
└── images/
    ├── intro-diagram.png
    └── basics-example.png
```

### Example B: Category-Based Structure
```
android-cs/
├── posts/
│   ├── android/
│   │   ├── activities.md
│   │   └── services.md
│   ├── kotlin/
│   │   ├── basics.md
│   │   └── coroutines.md
│   └── testing/
│       └── unit-tests.md
└── images/
    ├── android/
    │   └── activity-diagram.png
    ├── kotlin/
    │   └── coroutine-flow.png
    └── testing/
        └── test-pyramid.png
```

### Example C: Deep Hierarchy
```
android-cs/
├── posts/
│   └── jetpack/
│       ├── compose/
│       │   ├── basics/
│       │   │   ├── text.md
│       │   │   └── button.md
│       │   └── layouts/
│       │       ├── column.md
│       │       └── row.md
│       └── navigation/
│           └── nav-component.md
└── images/
    └── jetpack/
        ├── compose/
        │   └── examples.png
        └── navigation/
            └── nav-graph.png
```

---

## 💡 Tips & Tricks

### Tip 1: Consistent Naming
Use kebab-case for files and folders:
```
✅ activity-lifecycle.md
✅ memory-optimization.md
❌ Activity Lifecycle.md
❌ Memory_Optimization.md
```

### Tip 2: Image Paths
Use relative paths for portability:
```markdown
<!-- Good: Works if you move the folder -->
![Image](../../images/category/image.png)

<!-- Also good: Absolute from site root -->
![Image](/android-cs/images/category/image.png)
```

### Tip 3: Category Grouping
Use same category name in frontmatter for grouping:
```markdown
# File 1: posts/android/activity.md
category: Android

# File 2: posts/android/service.md  
category: Android

# Both appear under same "Android" group in sidebar
```

### Tip 4: Draft Posts
Hide work-in-progress posts:
```markdown
---
title: Work in Progress
draft: true
---
```

---

## 🔄 Migration Guide

### From old structure to new:

```bash
# Before: posts mixed with images
android-cs/
├── post1.md
├── post2.md
├── image1.png
└── image2.png

# After: organized structure
android-cs/
├── posts/
│   ├── post1.md
│   └── post2.md
└── images/
    ├── image1.png
    └── image2.png

# Migration commands:
mkdir -p android-cs/posts android-cs/images
mv android-cs/*.md android-cs/posts/
mv android-cs/*.png android-cs/images/
mv android-cs/*.jpg android-cs/images/
```

---

## 📚 References

- Full Guide: `ANDROIDCS_CONTENT_ORGANIZATION.md`
- GitBook Style: `GITBOOK_STYLE.md`
- Basic Usage: `ANDROIDCS_GUIDE.md`
