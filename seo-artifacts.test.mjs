import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function extractTagValue(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>([^<]+)</${tagName}>`));
  return match ? match[1] : null;
}

async function getRouteBody(routeModulePath) {
  const route = require(routeModulePath);
  const response = await route.routeModule.userland.GET();
  return response.text();
}

function extractBlocks(xml, tagName) {
  return Array.from(xml.matchAll(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'g')))
    .map((match) => match[1]);
}

test('robots.txt advertises the sitemap and blocks framework internals', async () => {
  const body = await getRouteBody('./.next-build/server/app/robots.txt/route.js');

  assert.match(body, /^User-Agent: \*$/m);
  assert.match(body, /^Disallow: \/_next\/$/m);
  assert.match(body, /^Sitemap: https:\/\/kimmandoo\.vercel\.app\/sitemap\.xml$/m);
});

test('sitemap homepage lastmod tracks actual latest published content', async () => {
  const xml = await getRouteBody('./.next-build/server/app/sitemap.xml/route.js');
  const urlBlocks = extractBlocks(xml, 'url');
  const entries = urlBlocks.map((block) => ({
    loc: extractTagValue(block, 'loc'),
    lastmod: extractTagValue(block, 'lastmod'),
  }));

  const homepage = entries.find((entry) => entry.loc === 'https://kimmandoo.vercel.app');
  const latestLastmod = entries.reduce((latest, entry) => {
    if (!entry.lastmod) {
      return latest;
    }

    return latest > entry.lastmod ? latest : entry.lastmod;
  }, '');

  assert.ok(homepage?.lastmod);
  assert.equal(homepage.lastmod, latestLastmod);
});

test('rss feed uses a stable build date based on the newest item date', async () => {
  const xml = await getRouteBody('./.next-build/server/app/feed.xml/route.js');
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
  const xml = await getRouteBody('./.next-build/server/app/feed.xml/route.js');
  const itemBlocks = extractBlocks(xml, 'item');

  assert.ok(itemBlocks.length > 0);

  itemBlocks.forEach((block) => {
    const description = extractTagValue(block, 'description');
    assert.ok(description && description.trim().length > 0);
  });
});
