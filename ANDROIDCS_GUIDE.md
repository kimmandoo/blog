# Android CS Wiki 사용 가이드

## 개요

블로그에 Android CS 지식을 위키 형식으로 정리할 수 있는 새로운 섹션이 추가되었습니다.

## 기능

- 상단 네비게이션 메뉴에서 "AndroidCS" 버튼을 통해 접근 가능
- 위키 형식의 문서 목록 페이지
- 블로그 포스트와 별도로 관리되는 콘텐츠

## 사용 방법

### 1. 문서 작성

`android-cs/` 디렉토리에 마크다운 파일을 추가하세요.

예시: `android-cs/activity-lifecycle.md`

```markdown
---
title: 액티비티 생명주기
date: 2024-01-15
excerpt: 안드로이드 액티비티의 생명주기에 대해 알아봅니다.
category: Android
tags: [android, activity, lifecycle]
---

# 액티비티 생명주기

액티비티의 생명주기에 대한 설명...
```

### 2. 폴더 구조

하위 폴더를 만들어 문서를 체계적으로 정리할 수 있습니다:

```
android-cs/
├── architecture/
│   ├── mvvm.md
│   └── clean-architecture.md
├── components/
│   ├── activity.md
│   └── service.md
└── performance/
    └── memory-management.md
```

### 3. 접근 방법

- 홈페이지: `http://your-site.com/`
- Android CS 목록: `http://your-site.com/androidcs`
- 개별 문서: `http://your-site.com/androidcs/[파일명]`
- 폴더 구조가 있는 경우: `http://your-site.com/androidcs/architecture/mvvm`

## 구현된 기능

1. **Navigation 컴포넌트**: Blog와 AndroidCS 간 전환이 가능한 네비게이션 메뉴
2. **AndroidCS 목록 페이지**: 모든 Android CS 문서를 위키 형식으로 보여주는 목록 페이지
3. **AndroidCS 개별 페이지**: 각 문서의 상세 내용을 보여주는 페이지 (ToC, 읽기 시간 등 지원)
4. **별도 라이브러리**: `lib/androidcs.ts`에서 Android CS 콘텐츠 관리

## 파일 구조

```
blog/
├── android-cs/           # Android CS 문서 저장 디렉토리
│   └── sample.md        # 샘플 문서
├── app/
│   ├── androidcs/       # AndroidCS 페이지
│   │   ├── page.tsx     # 목록 페이지
│   │   └── [...slug]/
│   │       └── page.tsx # 개별 문서 페이지
│   └── page.tsx         # 블로그 홈 (네비게이션 추가됨)
├── components/
│   └── Navigation.tsx   # 네비게이션 메뉴 컴포넌트
└── lib/
    └── androidcs.ts     # Android CS 콘텐츠 처리 라이브러리
```

## 기존 기능과의 차이점

- **블로그 포스트** (`posts/`): 시간순으로 정렬되는 일반적인 블로그 글
- **Android CS** (`android-cs/`): 위키 형식으로 정리되는 지식 문서

두 섹션은 완전히 독립적으로 관리되며, 네비게이션 메뉴를 통해 쉽게 전환할 수 있습니다.
