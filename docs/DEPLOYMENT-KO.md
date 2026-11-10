# 블로그 배포 가이드 (한국어)

## 🚀 GitHub Pages로 배포하기 (현재 방식)

- 주소: https://kimmandoo.github.io (저장소 이름이 `kimmandoo.github.io`여야 루트 주소로 열립니다)
- `main`에 푸시하면 `.github/workflows/deploy.yml`이 `npm run build`를 실행하고 `out/`을 Pages에 배포합니다.
- 최초 1회: 저장소 **Settings → Pages → Source**를 **GitHub Actions**로 설정하세요.
- `next.config.ts`의 `output: "export"`, `trailingSlash: true`로 모든 페이지를 `<경로>/index.html`로 만듭니다. 공유 이미지(`/og/...png`), 사이트맵, RSS도 빌드할 때 생성됩니다.
- 서버가 없으므로 SSR·ISR·HTTP 헤더·HTTP 리디렉션은 쓰지 않습니다. 목록 검색과 필터는 브라우저에서 처리하고, 예전 `/posts/ps/*` 주소는 meta refresh로 `/coding-test/ps/*`로 이동합니다.
- 글이나 설정을 바꾸면 푸시해서 다시 배포해야 반영됩니다.
- 로컬에서 배포 결과 확인: `npm run build && npm start`

## ✍️ 새 글 작성하기

### 1. `posts/` 폴더에 마크다운 파일 생성

예시: `posts/my-post.md`

```markdown
---
title: "제목"
date: "2025-01-20"
excerpt: "간단한 설명"
---

# 내용

여기에 본문을 작성하세요...
```

### 2. GitHub에 푸시

```bash
git add posts/my-post.md
git commit -m "새 글 추가"
git push
```

### 3. 자동 배포!

- GitHub에 푸시하면 Vercel이 **자동으로 감지**하고 배포합니다
- 1-2분 후 블로그에 새 글이 나타납니다

## 📝 마크다운 Front Matter 필드

- `title`: 글 제목 (필수)
- `date`: 작성 날짜 (필수) - 형식: `"YYYY-MM-DD"` 또는 `"YYYY-MM-DD HH:mm"`
- `excerpt`: 홈페이지에 표시될 요약 (선택)

## 🎨 디자인 특징

- ✅ 미니멀하고 모던한 화이트-블랙 톤
- ✅ 반응형 디자인 (모바일 최적화)
- ✅ 다크 모드 자동 지원
- ✅ 빠른 로딩 속도

## 🔧 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 열기
```

## 💡 주요 파일 구조

```
blog/
├── posts/              # 마크다운 글 저장 (여기에 .md 파일 추가)
├── app/
│   ├── page.tsx       # 홈페이지
│   └── posts/[slug]/  # 개별 글 페이지
├── lib/
│   └── posts.ts       # 마크다운 처리 유틸리티
└── public/            # 이미지 등 정적 파일
```

## 🌐 커스텀 도메인 연결 (선택사항)

1. Vercel 프로젝트 설정 → "Domains" 클릭
2. 도메인 추가
3. DNS 설정 안내에 따라 설정

## ❓ 문제 해결

### 빌드 실패 시
```bash
npm run build  # 로컬에서 빌드 테스트
```

### 글이 안 보일 때
- 파일이 `posts/` 폴더에 있는지 확인
- 파일 확장자가 `.md`인지 확인
- front matter에 `title`과 `date`가 있는지 확인

## 📚 더 알아보기

- [전체 영문 가이드](./DEPLOYMENT.md)
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 문서](https://nextjs.org/docs)

---

**질문이 있으시면 GitHub Issues에 올려주세요!**
