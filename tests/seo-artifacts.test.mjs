import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const buildDir = process.env.NEXT_DIST_DIR ?? '.next';

function extractTagValue(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>([^<]+)</${tagName}>`));
  return match ? match[1] : null;
}

async function getRouteBody(routeModulePath) {
  const route = require(routeModulePath);
  const response = await route.routeModule.userland.GET();
  return response.text();
}

function getBuildArtifactPath(relativePath) {
  return path.resolve(projectRoot, buildDir, relativePath);
}

function getPrerenderRoute(routePath) {
  const manifestPath = getBuildArtifactPath('prerender-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest.routes[routePath];
}

function extractBlocks(xml, tagName) {
  return Array.from(xml.matchAll(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'g')))
    .map((match) => match[1]);
}

async function loadMetadataHelpers() {
  return import(pathToFileURL(path.join(projectRoot, 'lib', 'metadata.ts')).href);
}

async function loadNextConfig() {
  const config = await import(pathToFileURL(path.join(projectRoot, 'next.config.ts')).href);
  return config.default;
}

function loadJsonLdComponents() {
  const filename = path.join(projectRoot, 'components', 'JsonLd.tsx');
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });
  const componentModule = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(
    createRequire(filename), componentModule, componentModule.exports,
  );
  return componentModule.exports;
}

function extractJsonLd(html) {
  return Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
    .map((match) => JSON.parse(match[1]));
}

test('robots.txt advertises the sitemap and leaves rendering assets crawlable', async () => {
  const body = await getRouteBody(getBuildArtifactPath('server/app/robots.txt/route.js'));

  assert.match(body, /^User-Agent: \*$/m);
  assert.match(body, /^Disallow: \/api\/$/m);
  assert.doesNotMatch(body, /_next/);
  assert.match(body, /^Sitemap: https:\/\/kimmandoo\.github\.io\/sitemap\.xml$/m);
});

test('sitemap homepage lastmod tracks actual latest published content', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/sitemap.xml/route.js'));
  const urlBlocks = extractBlocks(xml, 'url');
  const entries = urlBlocks.map((block) => ({
    loc: extractTagValue(block, 'loc'),
    lastmod: extractTagValue(block, 'lastmod'),
  }));

  const homepage = entries.find((entry) => entry.loc?.replace(/\/$/, '') === 'https://kimmandoo.github.io');
  const latestLastmod = entries.reduce((latest, entry) => {
    if (!entry.lastmod) {
      return latest;
    }

    return latest > entry.lastmod ? latest : entry.lastmod;
  }, '');

  assert.ok(homepage?.lastmod);
  assert.equal(homepage.lastmod, latestLastmod);
});

test('sitemap serves moved Android posts under posts and omits androidcs routes', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/sitemap.xml/route.js'));

  assert.match(xml, /https:\/\/kimmandoo\.github\.io\/posts\/android\/callbackFlow/);
  assert.doesNotMatch(xml, /\/androidcs/);
});

test('sitemap lists indexable pages only, not feed endpoints', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/sitemap.xml/route.js'));

  assert.doesNotMatch(xml, /https:\/\/kimmandoo\.github\.io\/feed\.xml/);
  assert.doesNotMatch(xml, /https:\/\/kimmandoo\.github\.io\/rss/);
});

test('rss feed uses a stable build date based on the newest item date', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/feed.xml/route.js'));
  const lastBuildDate = extractTagValue(xml, 'lastBuildDate');
  const itemBlocks = extractBlocks(xml, 'item');
  const latestPubDate = itemBlocks.reduce((latest, block) => {
    const pubDate = extractTagValue(block, 'pubDate');
    if (!pubDate) {
      return latest;
    }

    return new Date(latest) > new Date(pubDate) ? latest : pubDate;
  }, '');

  assert.ok(lastBuildDate);
  assert.equal(lastBuildDate, latestPubDate);
});

test('rss feed gives every item a non-empty description', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/feed.xml/route.js'));
  const itemBlocks = extractBlocks(xml, 'item');

  assert.ok(itemBlocks.length > 0);

  itemBlocks.forEach((block) => {
    const description = extractTagValue(block, 'description');
    assert.ok(description && description.trim().length > 0);
  });
});

test('rss alias serves a fetchable RSS feed for Search Console submissions', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/rss/route.js'));
  const itemBlocks = extractBlocks(xml, 'item');

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<rss version="2\.0" xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom">/);
  assert.match(xml, /<atom:link href="https:\/\/kimmandoo\.github\.io\/rss" rel="self" type="application\/rss\+xml"\/>/);
  assert.ok(itemBlocks.length > 0);
});

test('site is configured as a static export for GitHub Pages', async () => {
  const nextConfig = await loadNextConfig();

  assert.equal(nextConfig.output, 'export');
  assert.equal(nextConfig.headers, undefined);
  for (const routePath of ['/sitemap.xml', '/feed.xml', '/rss']) {
    const route = getPrerenderRoute(routePath);
    assert.ok(route, `${routePath} should be prerendered`);
    assert.equal(route.initialRevalidateSeconds, false);
  }
});

test('home metadata uses the root canonical and its prerendered share card', async () => {
  const { createHomePageMetadata } = await loadMetadataHelpers();
  const metadata = createHomePageMetadata();

  assert.equal(metadata.robots, undefined);
  assert.equal(metadata.alternates?.canonical, 'https://kimmandoo.github.io/');
  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.equal(metadata.openGraph?.images[0].url, 'https://kimmandoo.github.io/og/home.png');
});

test('PS archive shares its own title, description, and canonical rather than home metadata', async () => {
  const { createCodingTestPageMetadata } = await loadMetadataHelpers();
  const metadata = createCodingTestPageMetadata();

  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.equal(metadata.openGraph?.title, metadata.title);
  assert.equal(metadata.openGraph?.description, metadata.description);
  assert.equal(metadata.twitter?.title, metadata.title);
  assert.equal(metadata.twitter?.description, metadata.description);
});

test('article metadata uses the article URL and image for normal posts and PS notes', async () => {
  const { createArticleMetadata } = await loadMetadataHelpers();
  const post = {
    title: '큐 & 힙',
    excerpt: '우선순위 큐 풀이',
    date: '2026-04-19T12:00:00Z',
    category: 'PS',
    tags: ['queue', 'heap'],
  };

  for (const articlePath of ['/posts/cs/queue', '/coding-test/ps/cpp/queue']) {
    const metadata = createArticleMetadata(post, articlePath);
    const expectedUrl = `https://kimmandoo.github.io${articlePath}/`;
    assert.equal(metadata.alternates?.canonical, expectedUrl);
    assert.equal(metadata.openGraph?.url, expectedUrl);
    assert.equal(metadata.openGraph?.type, 'article');
    assert.equal(metadata.openGraph?.title, post.title);
    assert.equal(metadata.twitter?.title, post.title);
    assert.equal(metadata.openGraph?.description, post.excerpt);
    assert.equal(metadata.twitter?.description, post.excerpt);
    assert.equal(metadata.openGraph?.publishedTime, '2026-04-19T12:00:00.000Z');
    const image = metadata.openGraph.images[0].url;
    assert.deepEqual(metadata.twitter.images, [image]);
    assert.equal(new URL(image).pathname, `/og${articlePath}.png`);
  }

  // Inline article screenshots must not replace the branded sharing card.
  for (const firstImage of ['/media/queue.png', 'https://images.example/queue.png']) {
    const metadata = createArticleMetadata({ ...post, firstImage, excerpt: '' }, '/posts/cs/queue');
    assert.equal(metadata.description, post.title);
    const image = new URL(metadata.openGraph.images[0].url);
    assert.equal(image.pathname, '/og/posts/cs/queue.png');
    assert.deepEqual(metadata.twitter.images, [image.toString()]);
    assert.equal(metadata.openGraph.images[0].width, 1200);
  }
});

test('server-rendered structured data safely preserves text without closing its script', () => {
  const { ArticleJsonLd, BreadcrumbJsonLd } = loadJsonLdComponents();
  const text = '</script><script>alert("escaped")</script> & <정보>';
  const articleUrl = 'https://kimmandoo.github.io/coding-test/ps/queue';
  const articleHtml = renderToStaticMarkup(createElement(ArticleJsonLd, {
    title: text,
    description: text,
    url: articleUrl,
    tags: [text],
    datePublished: '2026-04-19T12:00:00.000Z',
    image: 'https://kimmandoo.github.io/media/queue.png',
  }));
  const breadcrumbHtml = renderToStaticMarkup(createElement(BreadcrumbJsonLd, {
    items: [{ name: 'Home', url: 'https://kimmandoo.github.io/' }, { name: text, url: articleUrl }],
  }));

  for (const html of [articleHtml, breadcrumbHtml]) {
    assert.equal((html.match(/<script/g) ?? []).length, 1);
    assert.equal((html.match(/<\/script>/g) ?? []).length, 1);
    assert.ok(html.includes('\\u003c'));
  }
  const [article] = extractJsonLd(articleHtml);
  assert.equal(article.headline, text);
  assert.equal(article.description, text);
  assert.equal(article.keywords, text);
  assert.equal(article.mainEntityOfPage['@id'], articleUrl);
  assert.equal(article.datePublished, '2026-04-19T12:00:00.000Z');
  assert.equal(article.dateModified, undefined);
  const [breadcrumb] = extractJsonLd(breadcrumbHtml);
  assert.equal(breadcrumb.itemListElement[1].name, text);
  assert.equal(breadcrumb.itemListElement[1].position, 2);
  assert.equal(breadcrumb.itemListElement[1].item, articleUrl);
});

test('website search structured data submits the real text query parameter', () => {
  const { WebSiteJsonLd } = loadJsonLdComponents();
  const [website] = extractJsonLd(renderToStaticMarkup(createElement(WebSiteJsonLd)));
  const query = 'queue & heap';
  const target = new URL(website.potentialAction.target.urlTemplate.replace(
    '{search_term_string}', encodeURIComponent(query),
  ));
  assert.equal(target.pathname, '/');
  assert.equal(target.searchParams.get('q'), query);
  assert.equal(target.searchParams.has('category'), false);
  assert.equal(website.potentialAction['query-input'], 'required name=search_term_string');
});

test('prerendered PS detail includes article and breadcrumb structured data at its canonical URL', () => {
  const manifest = JSON.parse(fs.readFileSync(getBuildArtifactPath('prerender-manifest.json'), 'utf8'));
  const routePath = Object.keys(manifest.routes).find((route) => route.startsWith('/coding-test/') && !route.includes('%'));
  assert.ok(routePath, 'at least one PS note should be prerendered');
  const html = fs.readFileSync(getBuildArtifactPath(`server/app${routePath}.html`), 'utf8');
  const data = extractJsonLd(html);
  const article = data.find((item) => item['@type'] === 'Article');
  const breadcrumbs = data.find((item) => item['@type'] === 'BreadcrumbList');
  const canonical = `https://kimmandoo.github.io${routePath}/`;

  assert.ok(article);
  assert.equal(article.url, canonical);
  assert.equal(article.mainEntityOfPage['@id'], canonical);
  assert.ok(article.headline);
  assert.ok(article.description);
  assert.ok(article.image.url.startsWith('https://'));
  assert.deepEqual(breadcrumbs.itemListElement.map((item) => item.item), [
    'https://kimmandoo.github.io/',
    'https://kimmandoo.github.io/coding-test/',
    canonical,
  ]);
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`));
  assert.ok(html.includes(`<meta property="og:url" content="${canonical}"`));
  assert.ok(html.includes('<meta property="og:type" content="article"'));
});
