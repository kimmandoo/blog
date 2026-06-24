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
const tableOfContents = fs.readFileSync(path.join(process.cwd(), 'components', 'TableOfContents.tsx'), 'utf8');
const codeBlock = fs.readFileSync(path.join(process.cwd(), 'components', 'CodeBlock.tsx'), 'utf8');
const categoryBadge = fs.readFileSync(path.join(process.cwd(), 'components', 'CategoryBadge.tsx'), 'utf8');
const tagBadge = fs.readFileSync(path.join(process.cwd(), 'components', 'TagBadge.tsx'), 'utf8');
const shareButtons = fs.readFileSync(path.join(process.cwd(), 'components', 'ShareButtons.tsx'), 'utf8');
const comments = fs.readFileSync(path.join(process.cwd(), 'components', 'Comments.tsx'), 'utf8');
const readingProgress = fs.readFileSync(path.join(process.cwd(), 'components', 'ReadingProgressBar.tsx'), 'utf8');
const postsLib = fs.readFileSync(path.join(process.cwd(), 'lib', 'posts.ts'), 'utf8');

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
  assert.doesNotMatch(globalCss, /\.mandoo-post-card::before/);
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

test('dense category filters are collapsed on mobile', () => {
  assert.match(postList, /<details className="group\/categories sm:contents">/);
  assert.match(postList, /<summary[\s\S]*sm:hidden/);
  assert.match(postList, /분류 보기/);
  assert.match(postList, /group-open\/categories:flex sm:flex/);
});

test('shared UI labels stay Korean where they are visible in the blog shell', () => {
  assert.match(themeConfig, /categories:\s*'분류'/);
  assert.match(themeConfig, /tags:\s*'태그'/);
  assert.match(themeConfig, /filter:\s*'필터:'/);
  assert.match(themeConfig, /viewAllPosts:\s*'전체 글 보기'/);
  assert.match(themeConfig, /comments:\s*'댓글'/);
});

test('theme toggle exposes light dark and system as icon-only choices', () => {
  assert.doesNotMatch(themeToggle, />\s*auto\s*</);
  assert.match(themeToggle, /theme-toggle/);
  assert.match(themeToggle, /theme-toggle__option/);
  assert.match(themeToggle, /theme-toggle__icon/);
  assert.match(themeToggle, /value:\s*'light'/);
  assert.match(themeToggle, /value:\s*'dark'/);
  assert.match(themeToggle, /value:\s*'system'/);
  assert.match(themeToggle, /aria-pressed=\{theme === option\.value\}/);
  assert.match(themeToggle, /aria-label=\{option\.label\}/);
  assert.match(themeToggle, /title=\{option\.label\}/);
  assert.match(themeToggle, /h-8 w-8/);
  assert.doesNotMatch(themeToggle, />\{option\.label\}</);
  assert.match(themeToggle, /fixed right-4 top-4/);
  assert.match(themeToggle, /sm:right-6 sm:top-6/);
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
  assert.match(postList, /mandoo-post-category/);
  assert.match(postList, /\{post\.category\}/);
  assert.match(postList, /border-rose-200\/80 bg-rose-50\/80/);
  assert.match(postList, /group-hover:border-rose-200/);
  assert.match(postList, /break-words text-base sm:text-xl font-bold mb-1 leading-snug text-gray-950 dark:text-white/);
  assert.match(postList, /overflowWrap: 'anywhere'/);
});

test('post list reads as a subtle timeline instead of loose cards', () => {
  assert.match(postList, /className="mandoo-post-list relative space-y-1 pl-4 sm:pl-5"/);
  assert.doesNotMatch(postList, /space-y-1 border-l/);
  assert.match(postList, /<Fragment key=\{post\.slug\}>/);
  assert.match(postList, /<article className="group relative">/);
  assert.match(postList, /mandoo-post-card py-4/);
  assert.match(postList, /sm:py-5/);
  assert.doesNotMatch(postList, /mandoo-post-card py-4 px-4 -mx-4 rounded-xl/);
});

test('post list motion is scoped and gentle', () => {
  assert.match(globalCss, /@keyframes mandoo-list-enter/);
  assert.match(getCssRule(globalCss, '.mandoo-post-list'), /animation:\s*mandoo-list-enter 160ms ease-out/);
  assert.doesNotMatch(globalCss, /article\s*\{\s*animation:/);
});

test('post list inserts month dividers into the timeline', () => {
  assert.match(postList, /function getPostMonthLabel\(post: PostData\)/);
  assert.match(postList, /formatDisplayDate\(post\.date,\s*\{\s*dateFormat: 'yyyy\.MM',\s*dateTimeFormat: 'yyyy\.MM'/);
  assert.match(postList, /className="mandoo-month-divider/);
  assert.match(postList, /showMonthDivider &&/);
});

test('taxonomy filters read like a compact tool surface', () => {
  assert.match(postList, /border-b border-gray-200\/70 pb-4 dark:border-gray-800\/70/);
  assert.match(postList, /text-xs font-semibold text-gray-500 dark:text-gray-400/);
  assert.doesNotMatch(postList, /uppercase tracking-wider/);
  assert.match(postList, /rounded-md border border-gray-200\/80 bg-white\/70 px-2\.5 py-1/);
});

test('search and taxonomy filters live in one quiet toolbar', () => {
  assert.match(postList, /<section\s+className="mb-7 space-y-4 border-b border-gray-200\/70 pb-4 dark:border-gray-800\/70"/);
  assert.match(postList, /<section[\s\S]*<SearchBar[\s\S]*\{\(allCategories\.length > 0 \|\| allTags\.length > 0\) && \(/);
  assert.match(postList, /<div className="space-y-3">[\s\S]*\{themeConfig\.text\.categories\}/);
});

test('search UX exposes result count and a clear affordance', () => {
  assert.match(searchBar, /aria-label="[^"]+"/);
  assert.match(searchBar, /pr-10/);
  assert.match(postList, /mandoo-search-status/);
  assert.match(postList, /filteredPosts\.length/);
  assert.match(postList, /initialPosts\.length/);
});

test('selected taxonomy state is shown as persistent filter pills', () => {
  assert.match(postList, /mandoo-active-filter/);
  assert.match(postList, /aria-label=\{`[^`]*selectedCategory/);
  assert.match(postList, /aria-label=\{`[^`]*selectedTag/);
  assert.match(postList, /href=\{sectionPath\}/);
});

test('post list density is tighter on mobile while keeping title emphasis', () => {
  assert.match(postList, /mandoo-post-card py-4/);
  assert.match(postList, /sm:py-5/);
  assert.match(postList, /leading-snug/);
  assert.match(postList, /gap-1/);
});

test('collapsible filters and mobile toc have open-state motion hooks', () => {
  assert.match(postList, /mandoo-details-panel hidden flex-wrap items-center gap-1\.5/);
  assert.match(postList, /mandoo-details-panel hidden flex-wrap items-center gap-1/);
  assert.match(tableOfContents, /mandoo-details-panel mt-4 space-y-1/);
  assert.match(getCssRule(globalCss, 'details[open] > .mandoo-details-panel'), /animation:\s*mandoo-details-open 140ms ease-out/);
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
  assert.match(postPage, /border-gray-200\/80 bg-white\/70 text-gray-600/);
  assert.match(postPage, /text-3xl sm:text-4xl md:text-5xl/);
  assert.match(postPage, /border-l-2 border-rose-200\/70/);
  assert.match(postPage, /prose-a:text-rose-600/);
  assert.match(postPage, /prose-headings:break-words/);
  assert.match(globalCss, /\.prose :where\(h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6,\s*p,\s*li\)/);
});

test('post detail has an editorial header and relaxed reading rhythm', () => {
  assert.match(postPage, /<header className=\{`mx-auto max-w-3xl pb-10 mb-10/);
  assert.match(postPage, /tracking-tight/);
  assert.match(postPage, /border-gray-200\/80 bg-white\/70 text-gray-600/);
  assert.match(postPage, /mt-5 max-w-2xl border-l-2 border-rose-200\/70/);
  assert.match(postPage, /prose-h2:[\s\S]*prose-h2:mb-5 prose-h2:mt-12/);
  assert.match(postPage, /prose-h3:[\s\S]*prose-h3:mb-4 prose-h3:mt-10/);
  assert.match(postPage, /prose-p:[\s\S]*prose-p:leading-8 prose-p:mb-7/);
});

test('post detail exposes a mobile collapsible table of contents', () => {
  assert.match(postPage, /<details className="mb-8 rounded-lg border border-gray-200\/80 bg-white\/70 p-4 dark:border-gray-800 dark:bg-gray-900\/50 xl:hidden">/);
  assert.match(postPage, /목차 보기/);
  assert.match(postPage, /<TableOfContents items=\{post\.toc\} compact \/>/);
});

test('table of contents highlights the current section on mobile and desktop', () => {
  assert.match(tableOfContents, /compact\?: boolean/);
  assert.match(tableOfContents, /mandoo-toc-link/);
  assert.match(tableOfContents, /mandoo-toc-link--active/);
  assert.match(tableOfContents, /aria-current=\{activeId === item\.id \? 'location' : undefined\}/);
  assert.match(postPage, /<TableOfContents items=\{post\.toc\} compact \/>/);
});

test('post table of contents extraction handles CRLF markdown headings', () => {
  assert.match(postsLib, /const normalizedLine = line\.replace\(\s*\/\\r\$\/,\s*''\s*\);/);
  assert.match(postsLib, /normalizedLine\.match\(\/\^\(`\{3,\}\)\/\)/);
  assert.match(postsLib, /normalizedLine\.match\(\/\^\(#\{1,6\}\)\\s\+\(\.\+\)\$\/\)/);
});

test('mobile code blocks show a horizontal scroll affordance', () => {
  assert.match(codeBlock, /code-block-scroll-hint/);
  assert.match(globalCss, /@media \(max-width:\s*640px\)/);
  assert.match(globalCss, /\.code-block-wrapper::before\s*\{/);
  assert.match(globalCss, /\.code-block-wrapper::after\s*\{/);
  assert.match(getCssRule(globalCss, '.code-block-wrapper::before'), /height:\s*2px/);
  assert.match(getCssRule(globalCss, '.code-block-wrapper::after'), /pointer-events:\s*none/);
  assert.match(getCssRule(globalCss, '.code-block-wrapper::after'), /linear-gradient\(90deg,\s*transparent,\s*var\(--background\)\)/);
  assert.match(globalCss, /\.code-block-wrapper\.has-code-block-toolbar::after\s*\{/);
});

test('rose stays as an accent instead of washing every surface pink', () => {
  assert.match(globalCss, /--mandoo-surface-hover:\s*rgba\(248,\s*250,\s*252,\s*0\.84\);/);
  assert.match(globalCss, /--mandoo-shadow:\s*0 14px 34px rgba\(15,\s*23,\s*42,\s*0\.08\);/);
  assert.match(getCssRule(globalCss, 'html.dark'), /--mandoo-surface-hover:\s*rgba\(15,\s*23,\s*42,\s*0\.32\);/);
  assert.match(postList, /group-hover:text-rose-600/);
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

test('adjacent post cards expose lightweight reading context', () => {
  assert.match(postNavigation, /category\?: string/);
  assert.match(postNavigation, /readingTime\?: number/);
  assert.match(postNavigation, /previousPost\.category/);
  assert.match(postNavigation, /previousPost\.readingTime/);
  assert.match(postNavigation, /nextPost\.category/);
  assert.match(postNavigation, /nextPost\.readingTime/);
  assert.match(postPage, /category: previousPost\.category/);
  assert.match(postPage, /readingTime: previousPost\.readingTime/);
});

test('interactive controls use small press and icon motion', () => {
  assert.match(postList, /mandoo-page-control/);
  assert.match(getCssRule(globalCss, '.mandoo-post-card'), /transition:\s*background-color 160ms ease/);
  assert.match(getCssRule(globalCss, '.mandoo-page-control:active'), /transform:\s*scale\(0\.98\)/);
  assert.match(getCssRule(globalCss, '.theme-toggle__icon'), /animation:\s*theme-toggle-pop 180ms ease-out/);
});

test('reading progress uses transform-based smoothing', () => {
  assert.match(readingProgress, /reading-progress-bar/);
  assert.match(readingProgress, /transform:\s*`scaleX\(\$\{progress \/ 100\}\)`/);
  assert.doesNotMatch(readingProgress, /width:\s*`\$\{progress\}%`/);
  assert.doesNotMatch(readingProgress, /strokeDasharray/);
  assert.doesNotMatch(readingProgress, /showFloatingIndicator/);
});

test('motion respects reduced-motion preferences', () => {
  assert.match(globalCss, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(globalCss, /animation:\s*none !important/);
  assert.match(globalCss, /transition-duration:\s*0\.01ms !important/);
  assert.match(globalCss, /\.mandoo-post-card:hover,\s*\.mandoo-page-control:active/);
});

test('empty and failed-search states read as designed UI states', () => {
  assert.match(postList, /mandoo-empty-state/);
  assert.match(postList, /mandoo-empty-state__icon/);
  assert.match(postList, /setSearchQuery\(''\)/);
  assert.match(postList, /filteredPosts\.length === 0/);
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
  assert.doesNotMatch(readingProgress, /strokeDasharray/);
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
