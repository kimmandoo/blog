import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';

// Native TS imports follow the existing tests; posts.ts also has extensionless local imports.
const libUrl = new URL('../lib/', import.meta.url).href;
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.startsWith(libUrl) && specifier.startsWith('.') && !extname(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
// This loading boundary must run after registering the native TypeScript resolution hook.
const { buildPostGraph } = await import('../lib/postGraph.ts');
hooks.deregister();

const siteUrl = 'https://example.com';

function post(slug, markdown = '', fields = {}) {
  return { slug, title: `Title: ${slug}`, markdown, ...fields };
}

test('real inline, reference, collapsed, shortcut, and autolinks form undirected edges', () => {
  const graph = buildPostGraph([
    post('notes/source', [
      '[inline](/posts/notes/inline)',
      '[reference][Mixed Label]',
      '[collapsed][]',
      '[shortcut]',
      '<https://example.com/posts/notes/auto>',
      '[Mixed Label]: /posts/notes/reference',
      '[collapsed]: /posts/notes/collapsed',
      '[shortcut]: /posts/notes/shortcut',
    ].join('\n\n')),
    ...['inline', 'reference', 'collapsed', 'shortcut', 'auto'].map((name) => post(`notes/${name}`)),
  ], siteUrl);

  assert.deepEqual(graph.edges, [
    { source: 'notes/auto', target: 'notes/source', kind: 'link' },
    { source: 'notes/collapsed', target: 'notes/source', kind: 'link' },
    { source: 'notes/inline', target: 'notes/source', kind: 'link' },
    { source: 'notes/reference', target: 'notes/source', kind: 'link' },
    { source: 'notes/shortcut', target: 'notes/source', kind: 'link' },
  ]);
  assert.equal(graph.nodes.length, 6);
});

test('images, code, math, frontmatter, unused definitions and invalid destinations add no edges', () => {
  const graph = buildPostGraph([
    post('source', [
      '---',
      'description: "[metadata](/posts/target)"',
      '---',
      '![image](/posts/target)',
      '![reference image][picture]',
      '`[inline code](/posts/target)`',
      '```markdown',
      '[fenced code](/posts/target)',
      '```',
      '    [indented code](/posts/target)',
      '$[math](/posts/target)$',
      '[external](https://other.example/posts/target)',
      '[other protocol](http://example.com/posts/target)',
      '[external relative](//other.example/posts/target)',
      '[mail](mailto:target@example.com)',
      '[invalid escape](/posts/%ZZ)',
      '[encoded separator](/posts/folder%2Ftarget)',
      '[outside posts directory](../target.md)',
      '[unknown](/posts/missing)',
      '[missing reference][unknown]',
      '[picture]: /posts/target',
      '[unused]: /posts/target',
    ].join('\n\n')),
    post('target'),
    post('folder/target'),
  ], siteUrl);

  assert.deepEqual(graph.edges, []);
  assert.deepEqual(graph.nodes.map((node) => node.id), ['folder/target', 'source', 'target']);
});

test('only eligible published normal and PS posts can be destinations or sources', () => {
  const graph = buildPostGraph([
    post('source', [
      '[draft](/posts/draft)',
      '[frontmatter draft](/posts/frontmatter-draft)',
      '[excluded](/posts/rust)',
      '[not supplied](/posts/not-eligible)',
      '[PS](/coding-test/ps/published)',
    ].join('\n')),
    post('draft', '[source](/posts/source)', { draft: true }),
    post('frontmatter-draft', '---\ndraft: true\n---\n[source](/posts/source)'),
    post('rust', '[source](/posts/source)', { category: 'Rust' }),
    post('ps/published', '', { category: 'PS' }),
    post('isolated'),
  ], siteUrl);

  assert.deepEqual(graph.nodes.map((node) => node.id), ['isolated', 'ps/published', 'source']);
  assert.deepEqual(graph.edges, [{ source: 'ps/published', target: 'source', kind: 'link' }]);
  assert.equal(graph.nodes[1].href, '/coding-test/ps/published');
});

test('canonical same-origin URLs strip queries and fragments and preserve encoded slugs', () => {
  const slug = '한국어/공백 #100%';
  const encoded = slug.split('/').map(encodeURIComponent).join('/');
  const graph = buildPostGraph([
    post('source', [
      `[absolute](https://example.com/posts/${encoded}?from=graph#section)`,
      `[root](/posts/${encoded}#heading)`,
      `[protocol relative](//example.com/posts/${encoded}?q=1)`,
      '[PS](/coding-test/ps/two%20words?language=cpp#solution)',
      '[wrong PS route](/posts/ps/only-wrong-route)',
    ].join('\n')),
    post(slug),
    post('ps/two words', '', { category: 'PS' }),
    post('ps/only-wrong-route', '', { category: 'PS' }),
  ], `${siteUrl}/`);

  assert.deepEqual(graph.edges, [
    { source: 'ps/only-wrong-route', target: 'ps/two words', kind: 'category' },
    { source: 'ps/two words', target: 'source', kind: 'link' },
    { source: 'source', target: slug, kind: 'link' },
  ]);
  assert.deepEqual(graph.nodes.find((node) => node.id === slug), {
    id: slug,
    title: `Title: ${slug}`,
    href: `/posts/${encoded}`,
  });
  assert.equal(graph.nodes.find((node) => node.id === 'ps/two words').href, '/coding-test/ps/two%20words');
});

test('relative markdown files resolve from the source slug directory across normal and PS routes', () => {
  const graph = buildPostGraph([
    post('nested/deep/source', [
      '[sibling](./sibling.md?view=full#heading)',
      '[parent](../parent.md)',
      '[encoded](../../한국어/공백%20%23100%25.md)',
      '[PS](../../ps/problem.md)',
      '[missing](../../missing.md)',
    ].join('\n')),
    post('nested/deep/sibling'),
    post('nested/parent'),
    post('한국어/공백 #100%'),
    post('ps/problem', '[normal](../nested/deep/source.md)', { category: 'PS' }),
  ], siteUrl);

  assert.deepEqual(graph.edges, [
    { source: 'nested/deep/sibling', target: 'nested/deep/source', kind: 'link' },
    { source: 'nested/deep/source', target: 'nested/parent', kind: 'link' },
    { source: 'nested/deep/source', target: 'ps/problem', kind: 'link' },
    { source: 'nested/deep/source', target: '한국어/공백 #100%', kind: 'link' },
  ]);
});

test('cycles, duplicate links and reciprocal links are deterministic without self edges', () => {
  const posts = [
    post('c', '[a](/posts/a) [b](/posts/b)'),
    post('a', '[b](/posts/b) [b again](/posts/b#again) [self](/posts/a) [anchor](#part) [file self](a.md)'),
    post('b', '[c](/posts/c) [a](/posts/a)'),
  ];
  const graph = buildPostGraph(posts, siteUrl);

  assert.deepEqual(graph.edges, [
    { source: 'a', target: 'b', kind: 'link' },
    { source: 'a', target: 'c', kind: 'link' },
    { source: 'b', target: 'c', kind: 'link' },
  ]);
  assert.deepEqual(graph.nodes.map((node) => node.id), ['a', 'b', 'c']);
  assert.deepEqual(buildPostGraph([...posts].reverse(), siteUrl), graph);
});

test('empty and uncategorized graphs retain every isolated node without cutoffs', () => {
  assert.deepEqual(buildPostGraph([], siteUrl), { nodes: [], edges: [] });
  const posts = Array.from({ length: 45 }, (_, index) => post(`isolated/${index}`, 'Plain text.'));
  const graph = buildPostGraph(posts, siteUrl);

  assert.equal(graph.nodes.length, posts.length);
  assert.deepEqual(graph.edges, []);
  assert.deepEqual(new Set(graph.nodes.map((node) => node.id)), new Set(posts.map((item) => item.slug)));
  assert.deepEqual(buildPostGraph([...posts].reverse(), siteUrl), graph);
});

test('every pair in a normalized category connects, with real links taking precedence', () => {
  const posts = [
    post('a', '[b](/posts/b) [b again](/posts/b#part) [self](/posts/a)', { category: ' Café ' }),
    post('b', '[a](/posts/a)', { category: 'Cafe\u0301' }),
    post('c', '', { category: 'Café' }),
    post('other', '', { category: 'Other' }),
  ];
  const graph = buildPostGraph(posts, siteUrl);
  assert.deepEqual(graph.edges, [
    { source: 'a', target: 'b', kind: 'link' },
    { source: 'a', target: 'c', kind: 'category' },
    { source: 'b', target: 'c', kind: 'category' },
  ]);
  assert.deepEqual(graph.nodes.map((node) => node.category), ['Café', 'Café', 'Café', 'Other']);
  assert.deepEqual(buildPostGraph([...posts].reverse(), siteUrl), graph);
});

test('category groups exclude drafts, excluded categories, and blank or missing categories', () => {
  const graph = buildPostGraph([
    post('a', '', { category: 'Topic' }),
    post('b', '', { category: ' Topic ' }),
    post('draft', '', { category: 'Topic', draft: true }),
    post('frontmatter-draft', '---\ndraft: true\n---\n', { category: 'Topic' }),
    post('rust-a', '', { category: 'Rust' }),
    post('rust-b', '', { category: ' Rust ' }),
    post('blank', '', { category: '' }),
    post('whitespace', '', { category: ' \t\n ' }),
    post('missing'),
  ], siteUrl);
  assert.deepEqual(graph.nodes.map((node) => node.id), ['a', 'b', 'blank', 'missing', 'whitespace']);
  assert.deepEqual(graph.edges, [{ source: 'a', target: 'b', kind: 'category' }]);
  for (const node of graph.nodes.slice(2)) assert.equal(node.category, undefined);
});

test('large same-category groups include every unique pair without a cutoff', () => {
  const posts = Array.from({ length: 45 }, (_, index) => post(`group/${index}`, '', { category: 'Same category' }));
  const graph = buildPostGraph(posts, siteUrl);
  assert.equal(graph.nodes.length, posts.length);
  assert.equal(graph.edges.length, posts.length * (posts.length - 1) / 2);
  assert.equal(new Set(graph.edges.map(({ source, target }) => JSON.stringify([source, target]))).size, graph.edges.length);
  assert.ok(graph.edges.every((edge) => edge.source < edge.target && edge.kind === 'category'));
  assert.deepEqual(buildPostGraph([...posts].reverse(), siteUrl), graph);
});
