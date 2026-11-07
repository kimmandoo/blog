import test from 'node:test';
import assert from 'node:assert/strict';

import { getPsArchive, getPsArchiveHref, normalizePsLanguage } from '../lib/ps.ts';
import { createCodingTestPageMetadata } from '../lib/metadata.ts';

function note(slug, fields = {}) {
  return { slug, title: slug, date: '2026-04-19', category: 'PS', ...fields };
}

test('PS languages come only from explicit metadata on published PS notes', () => {
  const archive = getPsArchive([
    note('ps/cpp', { language: 'cpp', content: '```java\nclass Comparison {}\n```' }),
    note('ps/cpp-alias', { language: ' C++ ' }),
    note('ps/new-language', { language: ' Zig ' }),
    note('ps/no-language', { tags: ['java'], content: '```java\nclass Example {}\n```' }),
    note('ps/blank-language', { language: '  ' }),
    note('ps/draft', { language: 'python', draft: true }),
    note('blog/java', { language: 'java', category: 'Blog' }),
  ]);

  assert.deepEqual(archive.languages, [
    { language: 'cpp', count: 2 },
    { language: 'zig', count: 1 },
    { language: 'unclassified', count: 2 },
  ]);
  assert.equal(archive.total, 5);
  assert.equal(archive.posts.length, 5);
});

test('language and existing tag filters intersect without changing archive counts or order', () => {
  const posts = [
    note('ps/first', { language: 'CPP', tags: ['heap', 'heap'] }),
    note('ps/second', { language: 'C++', tags: ['graph'] }),
    note('ps/third', { language: 'python', tags: ['heap'] }),
  ];
  const archive = getPsArchive(posts, { language: ' C++ ', tag: ' heap ' });

  assert.equal(archive.selectedLanguage, 'cpp');
  assert.equal(archive.selectedTag, 'heap');
  assert.deepEqual(archive.posts.map((post) => post.slug), ['ps/first']);
  assert.deepEqual(archive.languages, [
    { language: 'cpp', count: 2 },
    { language: 'python', count: 1 },
  ]);
  assert.deepEqual(archive.tags, [{ tag: 'graph', count: 1 }, { tag: 'heap', count: 2 }]);
  assert.deepEqual(getPsArchive(posts, { tag: 'heap' }).posts.map((post) => post.slug), ['ps/first', 'ps/third']);
  assert.deepEqual(getPsArchive(posts, { language: 'python', tag: 'graph' }).posts, []);
  assert.deepEqual(getPsArchive(posts, { language: 'rust' }).posts, []);
  assert.deepEqual(getPsArchive(posts, { tag: 'unknown' }).posts, []);
});

test('unclassified notes remain reachable and unfiltered archives have no hidden cutoff', () => {
  const posts = Array.from({ length: 25 }, (_, index) => note(`ps/${index}`));
  posts.push(note('ps/classified', { language: 'cpp' }));

  assert.equal(getPsArchive(posts).posts.length, 26);
  assert.equal(getPsArchive(posts, { language: 'unclassified' }).posts.length, 25);
  assert.equal(getPsArchive(posts, { language: '  ', tag: ' ' }).posts.length, 26);
  assert.equal(normalizePsLanguage(' C# '), 'csharp');
});

test('PS search composes with language and tag filters without changing taxonomy counts', () => {
  const posts = [
    note('ps/first', { title: 'Priority Queue', language: 'cpp', tags: ['heap'] }),
    note('ps/second', { title: 'Queue', language: 'python', tags: ['heap'] }),
    note('ps/third', { excerpt: 'Queue traversal', language: 'cpp', tags: ['graph'] }),
  ];
  const archive = getPsArchive(posts, { language: 'C++', tag: 'heap', q: ' QUEUE ' });

  assert.deepEqual(archive.posts.map(post => post.slug), ['ps/first']);
  assert.equal(archive.total, 3);
  assert.deepEqual(archive.languages, [{ language: 'cpp', count: 2 }, { language: 'python', count: 1 }]);
  assert.deepEqual(archive.tags, [{ tag: 'graph', count: 1 }, { tag: 'heap', count: 2 }]);
  assert.deepEqual(getPsArchive(posts, { q: 'queue traversal' }).posts.map(post => post.slug), ['ps/third']);
  assert.deepEqual(getPsArchive(posts, { q: 'HEAP' }).posts.map(post => post.slug), ['ps/first', 'ps/second']);
  assert.deepEqual(getPsArchive(posts, { q: 'c++' }).posts.map(post => post.slug), ['ps/first', 'ps/third']);
  assert.deepEqual(getPsArchive(posts, { q: 'missing' }).posts, []);
  assert.equal(getPsArchive(posts, { q: ' ' }).posts.length, 3);
});

test('PS filter URLs round-trip languages, tags and queries without losing punctuation', () => {
  const href = getPsArchiveHref({ language: 'C++', tag: 'queue & heap', q: 'queue & heap ' });
  const params = new URL(href, 'https://example.com').searchParams;
  const archive = getPsArchive([
    note('ps/heap', { language: 'cpp', tags: ['queue & heap'] }),
  ], { language: params.get('language'), tag: params.get('tag'), q: params.get('q') });

  assert.equal(params.get('language'), 'cpp');
  assert.equal(params.get('tag'), 'queue & heap');
  assert.equal(params.get('q'), 'queue & heap ');
  assert.equal(archive.posts.length, 1);
  assert.equal(getPsArchiveHref(), '/coding-test');
  assert.equal(getPsArchiveHref({ language: 'cpp' }), '/coding-test?language=cpp');
  assert.equal(getPsArchiveHref({ tag: 'heap' }), '/coding-test?tag=heap');
  assert.equal(getPsArchiveHref({ q: ' ' }), '/coding-test');
});

test('PS metadata is static and canonicalizes to the unfiltered archive', () => {
  const metadata = createCodingTestPageMetadata();
  assert.equal(metadata.robots, undefined);
  assert.equal(metadata.alternates?.canonical, 'https://mandoo.men/coding-test');
});

