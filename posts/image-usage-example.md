---
title: "이미지 사용 예시 (Image Usage Example)"
date: "2025-01-20"
excerpt: "블로그 포스트에 이미지를 추가하는 방법을 보여주는 예시입니다."
category: "Tutorial"
tags: ["images", "markdown", "guide"]
---

# 이미지 사용 예시

이 포스트는 블로그에서 이미지를 사용하는 다양한 방법을 보여줍니다.

## 이미지 추가의 기본

마크다운에서 이미지를 추가하는 것은 매우 간단합니다:

```markdown
![이미지 설명](/images/your-image.jpg)
```

## 로컬 이미지 사용하기

### 방법 1: public/images 폴더 사용

1. `public/images/` 폴더에 이미지 파일을 저장
2. 마크다운에서 `/images/` 경로로 참조

```markdown
![예시 이미지](/images/posts/example.jpg)
```

**폴더 구조:**
```
public/
  images/
    posts/
      my-image.jpg
      screenshot.png
```

### 방법 2: 날짜별 정리

포스트가 많아지면 날짜별로 폴더를 나누는 것이 좋습니다:

```
public/
  images/
    posts/
      2025-01/
        post1-image.jpg
        post1-diagram.png
      2025-02/
        post2-cover.jpg
```

## 외부 이미지 사용하기

외부 URL의 이미지도 사용할 수 있습니다:

```markdown
![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)
```

## 이미지 크기 조정

HTML을 사용하면 이미지 크기를 지정할 수 있습니다:

```html
<img src="/images/example.jpg" alt="예시" width="400" />
```

또는 퍼센트로:

```html
<img src="/images/example.jpg" alt="예시" style="width: 50%;" />
```

## 이미지에 링크 추가

이미지를 클릭하면 다른 페이지로 이동하게 만들 수 있습니다:

```markdown
[![클릭 가능한 이미지](/images/clickable.jpg)](https://example.com)
```

## 여러 이미지 나란히 배치

HTML을 사용하면 이미지를 나란히 배치할 수 있습니다:

```html
<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <img src="/images/image1.jpg" alt="이미지 1" style="width: 48%;" />
  <img src="/images/image2.jpg" alt="이미지 2" style="width: 48%;" />
</div>
```

## 이미지 최적화 팁

### 1. 적절한 파일 형식 선택
- **사진**: JPG 또는 WebP
- **로고/아이콘**: PNG 또는 SVG
- **애니메이션**: GIF 또는 WebP

### 2. 파일 크기 최적화
- 웹용으로 이미지 압축 (일반적으로 < 500KB)
- 필요한 해상도로만 저장 (보통 1920px 너비면 충분)

### 3. 의미있는 파일명 사용
```
✅ good: nextjs-app-router-diagram.png
❌ bad: IMG_1234.png
```

### 4. Alt 텍스트 작성
접근성과 SEO를 위해 항상 설명적인 alt 텍스트를 포함하세요:

```markdown
![Next.js 앱 라우터의 폴더 구조를 보여주는 다이어그램](/images/app-router.png)
```

## 이미지 스타일링

블로그의 이미지는 기본적으로 다음 스타일이 적용됩니다:
- 둥근 모서리
- 그림자 효과
- 반응형 크기 조정

이러한 스타일은 자동으로 적용되므로 별도 설정이 필요 없습니다!

## 빠른 체크리스트

이미지를 추가할 때 확인하세요:

- [ ] 이미지가 `public/images/` 폴더에 저장되어 있는가?
- [ ] 경로가 `/`로 시작하는가? (예: `/images/photo.jpg`)
- [ ] 파일명에 공백이 없고 소문자를 사용했는가?
- [ ] Alt 텍스트가 설명적인가?
- [ ] 파일 크기가 적절한가? (< 500KB 권장)

## 더 자세한 정보

더 자세한 가이드는 저장소의 `IMAGE_GUIDE.md` 파일을 참조하세요!

---

Happy blogging! 📸✨
