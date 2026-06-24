import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');
const homePage = fs.readFileSync(path.join(process.cwd(), 'app', 'page.tsx'), 'utf8');
const postList = fs.readFileSync(path.join(process.cwd(), 'components', 'PostList.tsx'), 'utf8');
const postNavigation = fs.readFileSync(path.join(process.cwd(), 'components', 'PostNavigation.tsx'), 'utf8');
const postPage = fs.readFileSync(path.join(process.cwd(), 'app', 'posts', '[...slug]', 'page.tsx'), 'utf8');
const codingTestPage = fs.readFileSync(path.join(process.cwd(), 'app', 'coding-test', 'page.tsx'), 'utf8');
const codingTestDetailPage = fs.readFileSync(path.join(process.cwd(), 'app', 'coding-test', '[...slug]', 'page.tsx'), 'utf8');
const themeConfig = fs.readFileSync(path.join(process.cwd(), 'config', 'theme.config.ts'), 'utf8');
const themeToggle = fs.readFileSync(path.join(process.cwd(), 'components', 'ThemeToggle.tsx'), 'utf8');
const searchBar = fs.readFileSync(path.join(process.cwd(), 'components', 'SearchBar.tsx'), 'utf8');
const categoryBadge = fs.readFileSync(path.join(process.cwd(), 'components', 'CategoryBadge.tsx'), 'utf8');
const tagBadge = fs.readFileSync(path.join(process.cwd(), 'components', 'TagBadge.tsx'), 'utf8');
const shareButtons = fs.readFileSync(path.join(process.cwd(), 'components', 'ShareButtons.tsx'), 'utf8');
const comments = fs.readFileSync(path.join(process.cwd(), 'components', 'Comments.tsx'), 'utf8');
const readingProgress = fs.readFileSync(path.join(process.cwd(), 'components', 'ReadingProgressBar.tsx'), 'utf8');

function getCssRule(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  return match?.[1] ?? '';
}

function getMarkdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory()
      ? getMarkdownFiles(fullPath)
      : entry.name.endsWith('.md')
        ? [fullPath]
        : [];
  });
}

test('global theme exposes mandoo accent tokens without custom cursor artwork', () => {
  const rootRule = getCssRule(globalCss, ':root');
  const darkRule = getCssRule(globalCss, 'html.dark');

  assert.match(rootRule, /--mandoo-cream:\s*#fff7ed;/);
  assert.match(rootRule, /--mandoo-pink:\s*#fb7185;/);
  assert.match(rootRule, /--mandoo-pink-soft:\s*rgba\(251,\s*113,\s*133,\s*0\.12\);/);
  assert.match(darkRule, /--mandoo-cream:\s*#111827;/);
  assert.match(darkRule, /--mandoo-pink-soft:\s*rgba\(251,\s*113,\s*133,\s*0\.18\);/);
  assert.doesNotMatch(globalCss, /--cursor-/);
  assert.doesNotMatch(globalCss, /cursor:\s*var\(--cursor-/);
});

test('home header keeps the brand compact and text-only', () => {
  assert.match(homePage, /className="site-brand/);
  assert.match(homePage, /<span>\{themeConfig\.site\.title\}<\/span>/);
  assert.match(homePage, /px-6 pt-8 sm:pt-12 pb-8/);
  assert.doesNotMatch(homePage, /className="site-brand__mark"/);
  assert.doesNotMatch(homePage, /stroke="#94a3b8"/);
  assert.doesNotMatch(globalCss, /\.site-brand__mark::before/);
  assert.doesNotMatch(globalCss, /\.site-brand__mark::after/);
});

test('search and post list surfaces use mandoo accent classes', () => {
  assert.match(searchBar, /mandoo-search/);
  assert.match(postList, /mandoo-post-card/);
  assert.match(postList, /group-hover:text-rose-600/);
  assert.match(getCssRule(globalCss, '.mandoo-search input'), /border-color:\s*rgba\(251,\s*113,\s*133,\s*0\.22\)/);
  assert.match(getCssRule(globalCss, '.mandoo-post-card'), /position:\s*relative/);
  assert.match(getCssRule(globalCss, '.mandoo-post-card::before'), /background:\s*var\(--mandoo-pink\)/);
  assert.match(getCssRule(globalCss, '.mandoo-post-card:hover'), /background:\s*var\(--mandoo-surface-hover\)/);
});

test('category and tag badges pick up the playful rose accent on hover', () => {
  assert.match(categoryBadge, /border-gray-200\/80/);
  assert.match(categoryBadge, /bg-white\/70/);
  assert.match(categoryBadge, /hover:bg-rose-50\/70/);
  assert.match(tagBadge, /hover:text-rose-600/);
  assert.match(tagBadge, /group-hover:bg-rose-100/);
});

test('dense tag filters are collapsed on mobile', () => {
  assert.match(postList, /<details className="group\/tags sm:contents">/);
  assert.match(postList, /<summary[\s\S]*sm:hidden/);
  assert.match(postList, /태그 보기/);
  assert.doesNotMatch(postList, /\{themeConfig\.text\.tags\}\s*<span className="normal-case tracking-normal">태그 보기<\/span>/);
});

test('shared UI labels stay Korean where they are visible in the blog shell', () => {
  assert.match(themeConfig, /categories:\s*'분류'/);
  assert.match(themeConfig, /tags:\s*'태그'/);
  assert.match(themeConfig, /filter:\s*'필터:'/);
  assert.match(themeConfig, /viewAllPosts:\s*'전체 글 보기'/);
  assert.match(themeConfig, /comments:\s*'댓글'/);
});

test('theme toggle does not show the cramped auto badge', () => {
  assert.doesNotMatch(themeToggle, />\s*auto\s*</);
  assert.match(themeToggle, /aria-label=\{`현재 테마:/);
  assert.match(themeToggle, /fixed right-4 top-4/);
  assert.match(themeToggle, /p-2\.5/);
  assert.match(themeToggle, /sm:right-6 sm:top-6 sm:p-3/);
  assert.doesNotMatch(themeToggle, /hover:scale-110/);
});

test('coding test page uses Korean shell labels', () => {
  assert.match(codingTestPage, />홈</);
  assert.match(codingTestPage, />PS 노트</);
  assert.match(codingTestPage, /\{threadPosts\.length\}개 글/);
  assert.match(codingTestPage, /\{post\.readingTime\}분/);
  assert.doesNotMatch(codingTestPage, />Home</);
  assert.doesNotMatch(codingTestPage, />PS Thread</);
  assert.doesNotMatch(codingTestPage, /\{threadPosts\.length\} posts/);
});

test('post list gives titles priority over muted metadata', () => {
  assert.match(postList, /text-xs font-normal text-gray-400 dark:text-gray-500/);
  assert.match(postList, /border-gray-200\/80 bg-gray-50\/80/);
  assert.match(postList, /group-hover:border-rose-200/);
  assert.match(postList, /break-words text-lg sm:text-xl font-bold mb-1 text-gray-950 dark:text-white/);
  assert.match(postList, /overflowWrap: 'anywhere'/);
});

test('taxonomy filters read like a compact tool surface', () => {
  assert.match(postList, /border-b border-gray-200\/70 pb-4 dark:border-gray-800\/70/);
  assert.match(postList, /text-xs font-semibold text-gray-500 dark:text-gray-400/);
  assert.doesNotMatch(postList, /uppercase tracking-wider/);
  assert.match(postList, /rounded-md border border-gray-200\/80 bg-white\/70 px-2\.5 py-1/);
});

test('coding test page shares the blog accent system', () => {
  assert.match(codingTestPage, /bg-gradient-to-br/);
  assert.match(codingTestPage, /hover:text-rose-600/);
  assert.match(codingTestPage, /border-rose-500 bg-rose-600/);
  assert.match(codingTestPage, /border-rose-200\/70 bg-rose-50\/50/);
  assert.match(codingTestPage, /hover:underline/);
});

test('post detail uses Korean navigation labels and mobile-safe prose wrapping', () => {
  assert.match(postPage, /전체 글로/);
  assert.match(postPage, /· \{post\.readingTime\}분/);
  assert.match(postPage, /홈으로/);
  assert.doesNotMatch(postPage, /Back to Home/);
  assert.match(postPage, /border-rose-200\/70 bg-rose-50\/50/);
  assert.match(postPage, /text-4xl md:text-5xl/);
  assert.match(postPage, /border-l-2 border-rose-200\/70/);
  assert.match(postPage, /prose-a:text-rose-600/);
  assert.match(postPage, /prose-headings:break-words/);
  assert.match(globalCss, /\.prose :where\(h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6,\s*p,\s*li\)/);
});

test('pagination and adjacent navigation avoid mechanical English labels', () => {
  assert.doesNotMatch(postList, /Page \{pagination\.currentPage\} of \{pagination\.totalPages\}/);
  assert.doesNotMatch(postList, />\s*Prev\s*</);
  assert.doesNotMatch(postList, />\s*Next\s*</);
  assert.match(postList, /\{pagination\.currentPage\} \/ \{pagination\.totalPages\}/);
  assert.match(postList, /aria-label="이전 페이지"/);
  assert.match(postList, /aria-label="다음 페이지"/);
  assert.match(postList, /border-rose-500 bg-rose-600/);

  assert.doesNotMatch(postNavigation, />\s*Previous\s*</);
  assert.doesNotMatch(postNavigation, />\s*Next\s*</);
  assert.match(postNavigation, /이전 글/);
  assert.match(postNavigation, /다음 글/);
});

test('coding test detail page shares Korean labels and rose accents', () => {
  assert.doesNotMatch(codingTestDetailPage, /\{post\.readingTime\} min/);
  assert.match(codingTestDetailPage, /\{post\.readingTime\}분/);
  assert.match(codingTestDetailPage, /bg-gradient-to-br/);
  assert.match(codingTestDetailPage, /hover:text-rose-600/);
  assert.match(codingTestDetailPage, /border-rose-200\/70 bg-rose-50\/50/);
  assert.doesNotMatch(searchBar, /Search posts/);
  assert.match(searchBar, /placeholder = "검색\.\.\."/);
});

test('supporting post UI shares rose accents and softer dark surfaces', () => {
  assert.match(themeConfig, /primary:\s*'dark:from-gray-950 dark:via-gray-900 dark:to-gray-950'/);
  assert.match(codingTestPage, /dark:from-gray-950 dark:via-gray-900 dark:to-gray-950/);
  assert.match(codingTestDetailPage, /dark:from-gray-950 dark:via-gray-900 dark:to-gray-950/);

  assert.doesNotMatch(shareButtons, />Share:</);
  assert.match(shareButtons, />공유</);
  assert.match(shareButtons, /hover:bg-rose-50\/70/);
  assert.match(shareButtons, /dark:hover:bg-rose-950\/30/);

  assert.match(comments, /bg-rose-500/);
  assert.doesNotMatch(comments, /bg-black dark:bg-white/);
  assert.match(readingProgress, /from-rose-500 via-pink-500 to-rose-500/);
  assert.match(readingProgress, /text-rose-500 dark:text-rose-300/);
});

test('visible post categories use canonical labels', () => {
  const markdown = getMarkdownFiles(path.join(process.cwd(), 'posts'))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

  assert.doesNotMatch(markdown, /^category:\s*Andriod$/m);
  assert.doesNotMatch(markdown, /^category:\s*ios$/m);
  assert.doesNotMatch(markdown, /^category:\s*kotlin$/m);
  assert.doesNotMatch(markdown, /^category:\s*Tip$/m);
});
