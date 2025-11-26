# 이미지 사용 가이드 (Image Usage Guide)

블로그 포스트에 이미지를 쉽게 추가하는 방법입니다.

## 📸 이미지 추가 방법

### 1. 로컬 이미지 사용하기

#### 단계 1: 이미지 파일 준비
`public/images/` 폴더에 이미지를 저장하세요. 폴더가 없다면 생성하세요.

```bash
# 이미지 폴더 구조 예시
public/
  images/
    post1-image.jpg
    screenshot.png
    diagram.svg
```

#### 단계 2: 마크다운에서 이미지 참조
마크다운 파일에서 다음과 같이 이미지를 참조하세요:

```markdown
![이미지 설명](/images/post1-image.jpg)
```

**예시:**
```markdown
---
title: "나의 첫 포스트"
date: "2025-01-20"
excerpt: "이미지가 포함된 포스트 예시"
---

# 이미지 예시

여기 이미지가 있습니다:

![멋진 풍경 사진](/images/landscape.jpg)

이미지는 자동으로 둥근 모서리와 그림자 효과가 적용됩니다.
```

### 2. 외부 이미지 URL 사용하기

외부 이미지는 전체 URL을 사용하세요:

```markdown
![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)
```

### 3. 이미지에 링크 추가하기

이미지를 클릭 가능하게 만들려면:

```markdown
[![이미지 설명](/images/photo.jpg)](https://example.com)
```

## 💡 팁과 베스트 프랙티스

### 이미지 최적화
- **크기**: 웹에 최적화된 크기로 이미지를 압축하세요 (일반적으로 < 500KB)
- **포맷**: 
  - 사진: `.jpg` 또는 `.webp`
  - 로고/아이콘: `.png` 또는 `.svg`
  - 애니메이션: `.gif` 또는 `.webp`

### 파일명 규칙
- 소문자 사용
- 공백 대신 하이픈(`-`) 사용
- 의미 있는 이름 사용
  ```
  ✅ good: my-blog-post-hero-image.jpg
  ❌ bad: IMG_1234.jpg
  ```

### Alt 텍스트 작성
항상 이미지에 설명적인 alt 텍스트를 포함하세요 (접근성 및 SEO 향상):

```markdown
✅ 좋은 예: ![Next.js 로고 - 검은 배경에 흰색 삼각형](/images/nextjs-logo.png)
❌ 나쁜 예: ![이미지](/images/image1.png)
```

## 📂 권장 폴더 구조

```
public/
  images/
    posts/           # 블로그 포스트 이미지
      2025-01/       # 날짜별 구조 (선택사항)
        post1-cover.jpg
        post1-diagram.png
      2025-02/
        post2-hero.jpg
    common/          # 공통 이미지 (아이콘, 로고 등)
      logo.png
      avatar.jpg
```

## 🎨 스타일링

이미지는 자동으로 다음 스타일이 적용됩니다:
- ✨ 둥근 모서리 (border-radius)
- 🎭 그림자 효과 (box-shadow)
- 📱 반응형 (최대 너비 자동 조정)

추가 스타일링이 필요하다면 HTML을 직접 사용할 수 있습니다:

```html
<img src="/images/my-image.jpg" alt="설명" width="400" height="300" />
```

## 📌 빠른 참조

```markdown
# 기본 이미지
![Alt text](/images/image.jpg)

# 외부 이미지
![Alt text](https://example.com/image.jpg)

# 링크가 있는 이미지
[![Alt text](/images/image.jpg)](https://example.com)

# HTML (추가 속성 필요시)
<img src="/images/image.jpg" alt="Alt text" width="500" />
```

## ❓ 자주 묻는 질문

### Q: 이미지가 표시되지 않아요
A: 다음을 확인하세요:
1. 이미지가 `public/` 폴더에 있는지 확인
2. 경로가 `/`로 시작하는지 확인 (예: `/images/photo.jpg`)
3. 파일명의 대소문자가 일치하는지 확인

### Q: 이미지가 너무 커요
A: 이미지 편집 도구로 크기를 조정하거나, HTML `width` 속성을 사용하세요:
```html
<img src="/images/large-image.jpg" alt="설명" width="600" />
```

### Q: GIF 애니메이션을 추가할 수 있나요?
A: 네! 일반 이미지와 동일한 방법으로 GIF를 추가할 수 있습니다:
```markdown
![애니메이션 설명](/images/animation.gif)
```

---

이 가이드를 따라하면 블로그 포스트에 쉽게 이미지를 추가할 수 있습니다! 🎉
