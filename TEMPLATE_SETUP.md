# Template Repository Setup Guide

이 저장소는 GitHub 템플릿 저장소로 설정되어 있어, 새로운 블로그를 빠르게 시작할 수 있습니다.

This repository is configured as a GitHub template repository, allowing you to quickly start a new blog.

## 🎯 템플릿 저장소란? (What is a Template Repository?)

템플릿 저장소는 Fork와 달리, 완전히 새로운 저장소를 생성할 수 있게 해줍니다:

A template repository allows you to create a brand new repository, unlike forking:

### Fork vs Template 차이점 (Differences)

| Feature | Fork | Template |
|---------|------|----------|
| 커밋 히스토리 (Commit History) | 전체 히스토리 포함 (Includes all history) | 새로운 히스토리 시작 (Fresh start) |
| 원본 저장소 연결 (Connection to original) | 연결됨 (Connected) | 독립적 (Independent) |
| 용도 (Purpose) | 기여/업스트림 (Contribute/upstream) | 새 프로젝트 시작 (Start new project) |
| 추천 사용 (Recommended for) | 원본 개선에 기여 (Contributing improvements) | 나만의 블로그 만들기 (Creating your own blog) |

## 🚀 빠른 시작 (Quick Start)

### 1. 템플릿으로 저장소 생성 (Create Repository from Template)

1. **GitHub에서 이 저장소 페이지로 이동 (Visit this repository on GitHub)**
   ```
   https://github.com/kimmandoo/blog
   ```

2. **"Use this template" 버튼 클릭 (Click the "Use this template" button)**
   - 저장소 상단의 초록색 "Use this template" 버튼을 찾으세요
   - Find the green "Use this template" button at the top of the repository

3. **"Create a new repository" 선택 (Select "Create a new repository")**

4. **새 저장소 정보 입력 (Fill in your new repository details):**
   - **Repository name**: `my-blog` 또는 원하는 이름 (or any name you want)
   - **Description**: 블로그에 대한 간단한 설명 (brief description of your blog)
   - **Public/Private**: Public 선택 (Vercel 무료 배포를 위해 / for free Vercel deployment)
   - ✅ **"Include all branches" 체크 해제** (Leave unchecked - you only need the main branch)

5. **"Create repository from template" 클릭 (Click "Create repository from template")**

### 2. 저장소 클론 (Clone Your Repository)

```bash
# Replace YOUR_USERNAME with your GitHub username
git clone https://github.com/YOUR_USERNAME/my-blog.git
cd my-blog
```

### 3. 의존성 설치 (Install Dependencies)

```bash
npm install
```

### 4. 설정 파일 수정 (Configure Your Blog)

**필수 수정 파일 (Required files to edit):**

#### `config/theme.config.ts`

```typescript
export const themeConfig = {
  site: {
    title: 'Your Blog Name',           // 블로그 이름
    description: 'Your description',   // 블로그 설명
    tagline: 'Your tagline',           // 블로그 태그라인
  },
  
  seo: {
    siteUrl: 'https://your-blog.vercel.app',  // 배포 후 실제 URL로 변경
    googleAnalytics: {
      enabled: false,  // 나중에 활성화 가능
      measurementId: '',
    },
  },
  
  socialLinks: {
    github: 'https://github.com/yourusername',
    linkedin: '',
    medium: '',
  },
  
  // ... 나머지 설정은 그대로 사용하거나 필요에 따라 수정
};
```

### 5. 샘플 포스트 제거 (Remove Sample Posts)

```bash
# 샘플 포스트 제거 (Remove sample posts)
rm -rf posts/samples
rm -rf posts/automation
rm -rf posts/leetcode

# 또는 원하는 샘플만 유지 (Or keep the ones you want)
```

### 6. 첫 포스트 작성 (Write Your First Post)

```bash
# 한국어 템플릿 복사 (Copy Korean template)
cp posts/my-first-post.md posts/2025-01-20-hello-world.md

# 또는 영문 템플릿 복사 (Or copy English template)
cp posts/samples/template-basic.md posts/2025-01-20-hello-world.md
```

템플릿을 편집하고 `draft: true`를 `draft: false`로 변경하거나 삭제하세요.

Edit the template and change `draft: true` to `draft: false` or remove it.

### 7. 로컬 테스트 (Test Locally)

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기 (Open http://localhost:3000 in your browser)

### 8. Vercel에 배포 (Deploy to Vercel)

#### 방법 1: Vercel 웹사이트 사용 (Using Vercel Website)

1. [vercel.com](https://vercel.com) 방문 및 GitHub로 로그인
2. "New Project" 클릭
3. 새로 만든 저장소 선택 (Select your new repository)
4. "Deploy" 클릭 (프레임워크는 자동 감지됨 / Framework auto-detected)

#### 방법 2: Vercel CLI 사용 (Using Vercel CLI)

```bash
# Vercel CLI 설치 (Install Vercel CLI)
npm install -g vercel

# 배포 (Deploy)
vercel

# 프로덕션 배포 (Deploy to production)
vercel --prod
```

### 9. 설정 완료 (Finalize Configuration)

배포 후 실제 URL로 설정 업데이트:

After deployment, update configuration with your actual URL:

```typescript
// config/theme.config.ts
seo: {
  siteUrl: 'https://your-actual-url.vercel.app',  // 실제 배포된 URL
}
```

변경사항을 커밋하고 푸시:

Commit and push changes:

```bash
git add .
git commit -m "Update configuration with actual URL"
git push
```

## 📝 템플릿 사용 후 해야 할 일 (Post-Template Checklist)

### 즉시 수정해야 할 것들 (Immediate Changes)

- [ ] `config/theme.config.ts` - 사이트 정보 수정 (site information)
- [ ] `config/theme.config.ts` - SEO URL 수정 (SEO URL)
- [ ] `config/theme.config.ts` - 소셜 링크 수정 (social links)
- [ ] `posts/` - 샘플 포스트 제거 또는 수정 (remove/edit sample posts)
- [ ] `public/favicon.ico` - 파비콘 교체 (replace favicon)
- [ ] `README.md` - 나만의 README 작성 (write your own README)

### 선택적으로 수정할 것들 (Optional Changes)

- [ ] `config/theme.config.ts` - 색상 테마 커스터마이징 (customize colors)
- [ ] `config/theme.config.ts` - Google Analytics 설정 (setup Google Analytics)
- [ ] `config/theme.config.ts` - Giscus 댓글 설정 (setup Giscus comments)
- [ ] `public/images/` - 이미지 추가 (add images)
- [ ] 카테고리와 태그 계획 (plan categories and tags)

### 배포 후 설정 (Post-Deployment Setup)

- [ ] Google Search Console 등록 (register with Google Search Console)
- [ ] Google Analytics 설정 (setup Google Analytics)
- [ ] 커스텀 도메인 연결 (optional: connect custom domain)
- [ ] RSS 피드 확인 (verify RSS feed at `/feed.xml`)

## 🎨 커스터마이징 가이드 (Customization Guide)

자세한 커스터마이징 방법은 다음 문서를 참고하세요:

For detailed customization instructions, see:

- **[THEME_CONFIG.md](/THEME_CONFIG.md)** - 테마 설정 가이드 (theme configuration)
- **[FORK_SETUP.md](/FORK_SETUP.md)** - 상세 설정 가이드 (detailed setup guide)
- **[TEMPLATE_GUIDE_KO.md](/TEMPLATE_GUIDE_KO.md)** - 템플릿 사용 가이드 (template usage guide)

## 🔧 저장소 소유자용: 템플릿 활성화 방법

**저장소 소유자만 해당 (Repository Owner Only)**

GitHub에서 이 저장소를 템플릿으로 설정하는 방법:

To enable template repository feature on GitHub:

1. 저장소 **Settings** 페이지로 이동 (Go to repository **Settings**)
2. **General** 섹션에서 "Template repository" 찾기 (Find "Template repository" in **General** section)
3. ✅ **"Template repository"** 체크박스 활성화 (Enable the checkbox)
4. 변경사항 저장 (Save changes)

이제 저장소 상단에 "Use this template" 버튼이 표시됩니다!

Now the "Use this template" button will appear at the top of your repository!

## 💡 팁 (Tips)

### 템플릿을 최신 상태로 유지하기 (Keeping Up with Template Updates)

템플릿 저장소는 원본과 독립적이므로, 원본 저장소의 업데이트를 받으려면:

Since template repositories are independent, to get updates from the original:

```bash
# 원본 저장소를 upstream으로 추가 (Add original repo as upstream)
git remote add upstream https://github.com/kimmandoo/blog.git

# 원본에서 가져오기 (Fetch from original)
git fetch upstream

# 선택적으로 변경사항 병합 (Optionally merge changes)
git merge upstream/main
# 또는 (or)
git cherry-pick <specific-commit>
```

### Git 히스토리 정리 (Clean Git History)

템플릿으로 생성하면 자동으로 깨끗한 히스토리로 시작되지만, 추가로 정리하고 싶다면:

Templates start with clean history, but if you want to clean further:

```bash
# 첫 커밋만 남기고 모든 히스토리 제거 (Remove all history, keep only first commit)
git checkout --orphan new-main
git add -A
git commit -m "Initial commit from template"
git branch -D main
git branch -m main
git push -f origin main
```

### 여러 블로그 만들기 (Creating Multiple Blogs)

같은 템플릿으로 여러 블로그를 만들 수 있습니다:

You can create multiple blogs from the same template:

1. "Use this template" 버튼으로 각 블로그마다 새 저장소 생성
2. 각각 다른 이름과 설정 사용
3. 각각 별도로 Vercel에 배포

## 🆘 문제 해결 (Troubleshooting)

### "Use this template" 버튼이 보이지 않아요

**문제**: 버튼이 표시되지 않음

**해결방법**:
1. 저장소 소유자가 Settings에서 "Template repository" 옵션을 활성화했는지 확인
2. 로그인 상태 확인
3. 브라우저 새로고침

### 배포 후 404 오류

**문제**: Vercel 배포 후 페이지가 404 오류

**해결방법**:
1. `config/theme.config.ts`의 `siteUrl` 확인
2. Vercel 빌드 로그 확인
3. `npm run build` 로컬에서 테스트

### 포스트가 표시되지 않아요

**문제**: 작성한 포스트가 블로그에 나타나지 않음

**해결방법**:
1. 포스트 frontmatter에 `draft: false` 또는 draft 필드 제거
2. `title`과 `date` 필드가 올바른지 확인
3. 파일이 `.md` 확장자인지 확인
4. 파일이 `posts/` 디렉토리 안에 있는지 확인

## 📚 추가 리소스 (Additional Resources)

- [GitHub Template Repository 문서](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- [Vercel 배포 가이드](/DEPLOYMENT.md)
- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 🤝 기여하기 (Contributing)

템플릿을 개선하고 싶다면 원본 저장소에 Pull Request를 보내주세요!

To improve the template, send a Pull Request to the original repository!

---

**즐거운 블로깅 되세요!** 🎉

**Happy blogging!** 🎉
