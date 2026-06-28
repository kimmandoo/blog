import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ogRouteSource = fs.readFileSync(path.join(process.cwd(), 'app', 'og', 'route.tsx'), 'utf8');
const postPageSource = fs.readFileSync(
  path.join(process.cwd(), 'app', 'posts', '[...slug]', 'page.tsx'),
  'utf8'
);
const postsSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'posts.ts'), 'utf8');

test('generated OG image uses a blog-native editorial layout', () => {
  assert.match(ogRouteSource, /editorialOgPalette/);
  assert.match(ogRouteSource, /articleSheet/);
  assert.match(ogRouteSource, /accentRule/);
  assert.match(ogRouteSource, /excerptLead/);
  assert.match(ogRouteSource, /metadataRail/);
  assert.match(ogRouteSource, /POST/);
  assert.match(ogRouteSource, /mandoo\.log/);
  assert.match(ogRouteSource, /displayUrl/);
  assert.match(ogRouteSource, /displayDescription/);
  assert.doesNotMatch(ogRouteSource, /blog post/);
  assert.doesNotMatch(ogRouteSource, /const excerptBand/);
  assert.doesNotMatch(ogRouteSource, /기록하고, 헷갈렸던 것을 다시 읽을 수 있게 남겨둡니다/);
  assert.doesNotMatch(ogRouteSource, /\$ read mandoo\.log/);
  assert.doesNotMatch(ogRouteSource, /gridLines/);
  assert.doesNotMatch(ogRouteSource, /monoFontFamily/);
  assert.doesNotMatch(ogRouteSource, /#0719af/);
  assert.doesNotMatch(ogRouteSource, /#0f0f23/);
});

test('post metadata passes the post path into generated OG images', () => {
  assert.match(postPageSource, /path:\s*`\/posts\/\$\{slugString\}`/);
  assert.match(postPageSource, /date:\s*formatDisplayDate\(post\.date\)/);
  assert.match(postPageSource, /new URLSearchParams\(\{[\s\S]*description:\s*post\.excerpt[\s\S]*category:/);
});

test('posts without frontmatter excerpts derive a post-specific excerpt from content', () => {
  assert.match(postsSource, /function createExcerptFromContent/);
  assert.match(postsSource, /excerpt:\s*matterResult\.data\.excerpt\s*\|\|\s*createExcerptFromContent\(matterResult\.content\)/);
});
