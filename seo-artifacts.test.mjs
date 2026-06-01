import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
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
  return `./${path.posix.join(buildDir.replace(/\\/g, '/'), relativePath.replace(/\\/g, '/'))}`;
}

function getPrerenderRoute(routePath) {
  const manifestPath = path.join(process.cwd(), buildDir, 'prerender-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest.routes[routePath];
}

function extractBlocks(xml, tagName) {
  return Array.from(xml.matchAll(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'g')))
    .map((match) => match[1]);
}

async function loadMetadataHelpers() {
  return import(pathToFileURL(path.join(process.cwd(), 'lib', 'metadata.ts')).href);
}

async function loadNextConfig() {
  const config = await import(pathToFileURL(path.join(process.cwd(), 'next.config.ts')).href);
  return config.default;
}

test('robots.txt advertises the sitemap and blocks framework internals', async () => {
  const body = await getRouteBody(getBuildArtifactPath('server/app/robots.txt/route.js'));

  assert.match(body, /^User-Agent: \*$/m);
  assert.match(body, /^Disallow: \/_next\/$/m);
  assert.match(body, /^Sitemap: https:\/\/kimmandoo\.vercel\.app\/sitemap\.xml$/m);
});

test('sitemap homepage lastmod tracks actual latest published content', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/sitemap.xml/route.js'));
  const urlBlocks = extractBlocks(xml, 'url');
  const entries = urlBlocks.map((block) => ({
    loc: extractTagValue(block, 'loc'),
    lastmod: extractTagValue(block, 'lastmod'),
  }));

  const homepage = entries.find((entry) => entry.loc?.replace(/\/$/, '') === 'https://kimmandoo.vercel.app');
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

  assert.match(xml, /https:\/\/kimmandoo\.vercel\.app\/posts\/android\/callbackFlow/);
  assert.doesNotMatch(xml, /\/androidcs/);
});

test('sitemap lists indexable pages only, not feed endpoints', async () => {
  const xml = await getRouteBody(getBuildArtifactPath('server/app/sitemap.xml/route.js'));

  assert.doesNotMatch(xml, /https:\/\/kimmandoo\.vercel\.app\/feed\.xml/);
  assert.doesNotMatch(xml, /https:\/\/kimmandoo\.vercel\.app\/rss/);
});

test('sitemap headers keep the file fetchable without noindex directives', async () => {
  const nextConfig = await loadNextConfig();
  const headers = await nextConfig.headers();
  const sitemapHeaders = headers.find((entry) => entry.source === '/sitemap.xml')?.headers ?? [];

  assert.equal(sitemapHeaders.some((header) => header.key.toLowerCase() === 'x-robots-tag'), false);
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
  assert.match(xml, /<atom:link href="https:\/\/kimmandoo\.vercel\.app\/rss" rel="self" type="application\/rss\+xml"\/>/);
  assert.ok(itemBlocks.length > 0);
});

test('sitemap is configured to revalidate instead of staying permanently static', () => {
  const sitemapRoute = getPrerenderRoute('/sitemap.xml');

  assert.ok(sitemapRoute);
  assert.equal(typeof sitemapRoute.initialRevalidateSeconds, 'number');
  assert.ok(sitemapRoute.initialRevalidateSeconds > 0);
});

test('filtered home page metadata is noindex and canonicalizes to the root page', async () => {
  const { createHomePageMetadata } = await loadMetadataHelpers();
  const metadata = createHomePageMetadata({ tag: 'retrospect' });

  assert.equal(metadata.robots?.index, false);
  assert.equal(metadata.robots?.follow, true);
  assert.equal(metadata.alternates?.canonical, 'https://kimmandoo.vercel.app/');
});

test('paginated home page metadata is noindex and canonicalizes to the root page', async () => {
  const { createHomePageMetadata } = await loadMetadataHelpers();
  const metadata = createHomePageMetadata({ page: '2' });

  assert.equal(metadata.robots?.index, false);
  assert.equal(metadata.robots?.follow, true);
  assert.equal(metadata.alternates?.canonical, 'https://kimmandoo.vercel.app/');
});

test('filtered coding-test page metadata is noindex and canonicalizes to the section root', async () => {
  const { createCodingTestPageMetadata } = await loadMetadataHelpers();
  const metadata = createCodingTestPageMetadata({ tag: 'ps' });

  assert.equal(metadata.robots?.index, false);
  assert.equal(metadata.robots?.follow, true);
  assert.equal(metadata.alternates?.canonical, 'https://kimmandoo.vercel.app/coding-test');
});

test('coding-test index metadata canonicalizes to the section root by default', async () => {
  const { createCodingTestPageMetadata } = await loadMetadataHelpers();
  const metadata = createCodingTestPageMetadata({});

  assert.equal(metadata.robots, undefined);
  assert.equal(metadata.alternates?.canonical, 'https://kimmandoo.vercel.app/coding-test');
});
