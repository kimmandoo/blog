import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { Root, RootContent } from 'mdast';
import { themeConfig } from '../config/theme.config.ts';
import { getSortedPostsData, getSortedPostsDataByCategory } from './posts.ts';

export type PostGraphNode = { id: string; title: string; href: string };
export type PostGraphEdge = { source: string; target: string };
export type PostGraph = { nodes: PostGraphNode[]; edges: PostGraphEdge[] };

export type PostGraphSource = {
  slug: string;
  title: string;
  markdown: string;
  category?: string;
  draft?: boolean;
};

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function decodePath(pathname: string): string | undefined {
  try {
    const segments = pathname.split('/').map(decodeURIComponent);
    // Encoded separators must not turn a different URL into a known post path.
    if (segments.some((segment) => /[/\\]/.test(segment) || segment.includes('\0'))) return undefined;
    return segments.join('/');
  } catch {
    return undefined;
  }
}

function visit(node: Root | RootContent, callback: (node: Root | RootContent) => void) {
  callback(node);
  if ('children' in node) {
    for (const child of node.children) visit(child, callback);
  }
}

/** Build only from eligible posts; unknown destinations never create graph nodes. */
export function buildPostGraph(posts: readonly PostGraphSource[], siteUrl: string): PostGraph {
  const origin = new URL(siteUrl).origin;
  const sources = posts
    .filter((post) => !post.draft && post.category !== 'Rust')
    .map((post) => ({ post, document: matter(post.markdown) }))
    .filter(({ document }) => !document.data.draft)
    .sort((left, right) => compare(left.post.slug, right.post.slug));
  const nodes = sources.map(({ post }) => ({
    id: post.slug,
    title: post.title,
    href: `/${post.category === 'PS' ? 'coding-test' : 'posts'}/${post.slug.split('/').map(encodeURIComponent).join('/')}`,
  }));
  const bySlug = new Map(nodes.map((node) => [node.id, node]));
  const byPath = new Map(nodes.map((node) => [decodePath(node.href), node]));
  const edges = new Map<string, PostGraphEdge>();
  const parser = remark().use(remarkGfm).use(remarkMath);

  function resolveTarget(destination: string, source: PostGraphNode): PostGraphNode | undefined {
    if (!destination || destination.startsWith('#') || destination.includes('\\')) return undefined;
    try {
      const isRelative = !destination.startsWith('/') && !/^[a-z][a-z\d+.-]*:/i.test(destination);
      const url = new URL(destination, new URL(source.href, origin));
      if (url.origin !== origin) return undefined;
      if (isRelative && url.pathname.endsWith('.md')) {
        // Markdown file links are relative to the source file, not its public route.
        const relativePath = decodePath(destination.split(/[?#]/, 1)[0]);
        if (relativePath === undefined) return undefined;
        const filePath = path.posix.normalize(path.posix.join(path.posix.dirname(source.id), relativePath));
        if (filePath.startsWith('../')) return undefined;
        return bySlug.get(filePath.slice(0, -3));
      }
      const pathname = decodePath(url.pathname);
      return pathname === undefined ? undefined : byPath.get(pathname);
    } catch {
      return undefined;
    }
  }

  for (const { post, document } of sources) {
    const source = bySlug.get(post.slug)!;
    const tree = parser.parse(document.content);
    const definitions = new Map<string, string>();
    visit(tree, (node) => {
      if (node.type === 'definition' && !definitions.has(node.identifier)) {
        definitions.set(node.identifier, node.url);
      }
    });
    visit(tree, (node) => {
      const destination = node.type === 'link'
        ? node.url
        : node.type === 'linkReference' ? definitions.get(node.identifier) : undefined;
      if (!destination) return;
      const target = resolveTarget(destination, source);
      if (!target || target.id === source.id) return;
      const edge = compare(source.id, target.id) < 0
        ? { source: source.id, target: target.id }
        : { source: target.id, target: source.id };
      edges.set(JSON.stringify([edge.source, edge.target]), edge);
    });
  }

  return {
    nodes,
    edges: [...edges.values()].sort((left, right) =>
      compare(left.source, right.source) || compare(left.target, right.target)),
  };
}

export function getPostGraph(): PostGraph {
  const posts = [...getSortedPostsData(), ...getSortedPostsDataByCategory('PS')];
  return buildPostGraph(posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    markdown: fs.readFileSync(path.join(process.cwd(), 'posts', `${post.slug}.md`), 'utf8'),
  })), themeConfig.seo.siteUrl);
}
