import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');
const homePage = fs.readFileSync(path.join(process.cwd(), 'app', 'page.tsx'), 'utf8');
const postList = fs.readFileSync(path.join(process.cwd(), 'components', 'PostList.tsx'), 'utf8');
const searchBar = fs.readFileSync(path.join(process.cwd(), 'components', 'SearchBar.tsx'), 'utf8');
const categoryBadge = fs.readFileSync(path.join(process.cwd(), 'components', 'CategoryBadge.tsx'), 'utf8');
const tagBadge = fs.readFileSync(path.join(process.cwd(), 'components', 'TagBadge.tsx'), 'utf8');

function getCssRule(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  return match?.[1] ?? '';
}

test('global theme exposes mandoo accent tokens shared with cursor artwork', () => {
  const rootRule = getCssRule(globalCss, ':root');
  const darkRule = getCssRule(globalCss, 'html.dark');

  assert.match(rootRule, /--mandoo-cream:\s*#fff7ed;/);
  assert.match(rootRule, /--mandoo-pink:\s*#fb7185;/);
  assert.match(rootRule, /--mandoo-pink-soft:\s*rgba\(251,\s*113,\s*133,\s*0\.12\);/);
  assert.match(darkRule, /--mandoo-cream:\s*#111827;/);
  assert.match(darkRule, /--mandoo-pink-soft:\s*rgba\(251,\s*113,\s*133,\s*0\.18\);/);
});

test('home header carries a subtle dumpling brand mark', () => {
  assert.match(homePage, /className="site-brand/);
  assert.match(homePage, /<svg[\s\S]*className="site-brand__mark"/);
  assert.match(homePage, /viewBox="0 0 32 32"/);
  assert.match(homePage, /fill="var\(--mandoo-cream\)"/);
  assert.match(homePage, /fill="var\(--mandoo-pink\)"/);
  assert.doesNotMatch(homePage, /stroke="#94a3b8"/);
  assert.doesNotMatch(homePage, /<span className="site-brand__mark"/);
  assert.doesNotMatch(globalCss, /\.site-brand__mark::before/);
  assert.doesNotMatch(globalCss, /\.site-brand__mark::after/);
  assert.match(getCssRule(globalCss, '.site-brand__mark'), /width:\s*1\.65rem/);
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
  assert.match(categoryBadge, /border-rose-200\/70/);
  assert.match(categoryBadge, /hover:bg-rose-50/);
  assert.match(tagBadge, /hover:text-rose-600/);
  assert.match(tagBadge, /group-hover:bg-rose-100/);
});
