import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import { calculateReadingTime } from './readingTime';
import { normalizeFrontmatterDate, parseDateValue } from './date';

const postsDirectory = path.join(process.cwd(), 'posts');
const MAX_EXCERPT_LENGTH = 110;

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface PostData {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  language?: string;
  toc?: TOCItem[];
  draft?: boolean;
  readingTime?: number;
  firstImage?: string | null;
}

// Helper function to recursively find all markdown files
function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Recursively get files from subdirectories
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.md')) {
      // Get relative path from base posts directory
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

function trimExcerpt(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length > MAX_EXCERPT_LENGTH
    ? `${normalized.slice(0, MAX_EXCERPT_LENGTH - 1).trim()}…`
    : normalized;
}

function createExcerptFromContent(content: string): string {
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];
  let codeBlockFence: string | null = null;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  };

  for (const line of content.split('\n')) {
    const normalizedLine = line.replace(/\r$/, '');
    const trimmedLine = normalizedLine.trim();
    const backtickMatch = trimmedLine.match(/^(`{3,})/);
    const tildeMatch = trimmedLine.match(/^(~{3,})/);

    if (backtickMatch || tildeMatch) {
      const fence = backtickMatch?.[1] ?? tildeMatch?.[1] ?? '';
      if (codeBlockFence === null) {
        flushParagraph();
        codeBlockFence = fence;
      } else if (fence.length >= codeBlockFence.length) {
        codeBlockFence = null;
      }
      continue;
    }

    if (codeBlockFence !== null) {
      continue;
    }

    if (!trimmedLine) {
      flushParagraph();
      continue;
    }

    if (
      /^#{1,6}\s+/.test(trimmedLine) ||
      /^!\[[^\]]*\]\([^)]+\)/.test(trimmedLine) ||
      /^[-*_]{3,}$/.test(trimmedLine) ||
      /^\|/.test(trimmedLine)
    ) {
      flushParagraph();
      continue;
    }

    currentParagraph.push(
      trimmedLine
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*_~>#]/g, '')
        .replace(/<[^>]+>/g, '')
        .trim()
    );
  }

  flushParagraph();

  return trimExcerpt(paragraphs.find(Boolean) ?? '');
}

function getAllPostsData(): PostData[] {
  const fileNames = fs.existsSync(postsDirectory)
    ? getAllMarkdownFiles(postsDirectory)
    : [];

  const allPostsData = fileNames
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '').replace(/\\/g, '/');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      const readingTime = calculateReadingTime(matterResult.content);

      return {
        slug,
        title: matterResult.data.title || slug,
        date: normalizeFrontmatterDate(matterResult.data.date),
        category: matterResult.data.category || '',
        tags: matterResult.data.tags || [],
        draft: matterResult.data.draft || false,
        readingTime,
        ...(matterResult.data as Omit<PostData, 'slug' | 'title' | 'date' | 'excerpt' | 'category' | 'tags' | 'draft' | 'readingTime'>),
        excerpt: trimExcerpt(matterResult.data.excerpt || createExcerptFromContent(matterResult.content)),
        ...(matterResult.data.updated && { updated: normalizeFrontmatterDate(matterResult.data.updated) }),
      };
    })
    .filter(post => !post.draft);

  return allPostsData.sort((a, b) => {
    const dateA = parseDateValue(a.date)?.getTime() ?? 0;
    const dateB = parseDateValue(b.date)?.getTime() ?? 0;
    return dateB - dateA;
  });
}

export function getSortedPostsData(): PostData[] {
  return getAllPostsData().filter(post => post.category !== 'PS' && post.category !== 'Rust');
}

export function getSortedPostsDataByCategory(category: string): PostData[] {
  return getAllPostsData().filter(post => post.category === category);
}

export function getAllPostSlugs() {
  return getSortedPostsData().map((post) => ({ slug: post.slug }));
}

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function walkElements(node: HastNode, visit: (element: HastNode) => void) {
  if (node.type === 'element') visit(node);
  node.children?.forEach((child) => walkElements(child, visit));
}

function headingText(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  if (node.tagName === 'img') return String(node.properties?.alt ?? '');
  let text = '';
  for (const child of node.children ?? []) text += headingText(child);
  return text;
}

const pngSizeCache = new Map<string, { width: number; height: number } | null>();

function readLocalPngSize(src: string) {
  if (pngSizeCache.has(src)) return pngSizeCache.get(src)!;
  let size: { width: number; height: number } | null = null;
  try {
    const filePath = path.join(process.cwd(), 'public', decodeURIComponent(src.split(/[?#]/)[0]));
    const header = Buffer.alloc(24);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, header, 0, 24, 0);
    fs.closeSync(fd);
    // PNG signature followed by the IHDR chunk, whose first fields are width and height.
    if (header.readUInt32BE(0) === 0x89504e47 && header.toString('ascii', 12, 16) === 'IHDR') {
      size = { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
    }
  } catch {
    size = null;
  }
  pngSizeCache.set(src, size);
  return size;
}

// The page title is the only h1, so posts that use `#` for sections are shifted down one level.
// Images get lazy loading and, for local PNGs, intrinsic dimensions to reserve layout space.
function rehypeArticleElements({ toc }: { toc: TOCItem[] }) {
  return (tree: HastNode) => {
    let hasH1 = false;
    const tables: HastNode[] = [];
    walkElements(tree, (element) => {
      if (element.tagName === 'h1') hasH1 = true;
    });

    walkElements(tree, (element) => {
      if (element.tagName === 'table') tables.push(element);
      const headingLevel = element.tagName?.match(/^h([1-6])$/)?.[1];
      if (headingLevel) {
        const level = Math.min(Number(headingLevel) + Number(hasH1), 6);
        element.tagName = `h${level}`;
        const properties = (element.properties ??= {});
        properties.tabIndex = -1;
        if (typeof properties.id === 'string') {
          toc.push({ id: properties.id, text: headingText(element), level });
        }
      }

      if (element.tagName !== 'img') return;
      const properties = (element.properties ??= {});
      properties.loading ??= 'lazy';
      properties.decoding ??= 'async';
      const src = typeof properties.src === 'string' ? properties.src : '';
      if (src.startsWith('/') && properties.width === undefined && properties.height === undefined) {
        const size = readLocalPngSize(src);
        if (size) {
          properties.width = size.width;
          properties.height = size.height;
        }
      }
    });
    // Keep the table semantics while giving wide tables a keyboard/touch viewport.
    for (const table of tables) {
      const content = { ...table };
      table.tagName = 'div';
      table.properties = {
        className: ['table-scroll'],
        tabIndex: 0,
        role: 'region',
        ariaLabel: '표. 좌우 방향키 또는 스크롤로 이동',
      };
      table.children = [content];
    }
  };
}

export async function getPostData(slug: string): Promise<PostData> {
  // Handle nested slugs (e.g., "folder/post" or just "post")
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Check if post is draft and throw error to prevent direct access
  if (matterResult.data.draft) {
    throw new Error('Post not found');
  }

  const toc: TOCItem[] = [];
  
  // Extract first image from markdown content
  const firstImage = extractFirstImage(matterResult.content);
  
  // Calculate reading time
  const readingTime = calculateReadingTime(matterResult.content);

  // Use remark to convert markdown into HTML string
  // Note: rehype-sanitize is not used here as all markdown content comes from 
  // trusted sources (repository files) controlled by the site owner, not user input.
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkEmoji)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeKatex)
    .use(rehypeArticleElements, { toc })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the slug and contentHtml
  return {
    slug,
    content: contentHtml,
    title: matterResult.data.title || slug,
    date: normalizeFrontmatterDate(matterResult.data.date),
    category: matterResult.data.category || '',
    tags: matterResult.data.tags || [],
    draft: matterResult.data.draft || false,
    toc,
    readingTime,
    firstImage,
    ...(matterResult.data as Omit<PostData, 'slug' | 'title' | 'date' | 'content' | 'excerpt' | 'category' | 'tags' | 'draft' | 'toc' | 'readingTime' | 'firstImage'>),
    excerpt: trimExcerpt(matterResult.data.excerpt || createExcerptFromContent(matterResult.content)),
    ...(matterResult.data.updated && { updated: normalizeFrontmatterDate(matterResult.data.updated) }),
  };
}


// Helper function to extract the first image from markdown content
// Regex patterns declared as constants for better performance
const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/;
const HTML_IMAGE_REGEX = /<img[^>]+src=["']([^"']+)["']/;

function extractFirstImage(content: string): string | null {
  const lines = content.split('\n');
  let codeBlockFence: string | null = null;
  
  for (const line of lines) {
    // Check for code block fence (``` or ~~~) at start of line
    const backtickMatch = line.match(/^(`{3,})/);
    const tildeMatch = line.match(/^(~{3,})/);
    
    if (backtickMatch) {
      if (codeBlockFence === null) {
        codeBlockFence = backtickMatch[1];
      } else if (codeBlockFence[0] === '`' && backtickMatch[1].length >= codeBlockFence.length) {
        codeBlockFence = null;
      }
      continue;
    }
    
    if (tildeMatch) {
      if (codeBlockFence === null) {
        codeBlockFence = tildeMatch[1];
      } else if (codeBlockFence[0] === '~' && tildeMatch[1].length >= codeBlockFence.length) {
        codeBlockFence = null;
      }
      continue;
    }
    
    // Skip images inside code blocks
    if (codeBlockFence !== null) {
      continue;
    }
    
    // Match markdown images: ![alt text](image-url)
    const markdownImageMatch = line.match(MARKDOWN_IMAGE_REGEX);
    if (markdownImageMatch) {
      const imageUrl = markdownImageMatch[2].trim();
      // Return the image URL if it's a valid non-empty string
      if (imageUrl && imageUrl.length > 0) {
        return imageUrl;
      }
    }
    
    // Match HTML images: <img src="image-url" ...>
    const htmlImageMatch = line.match(HTML_IMAGE_REGEX);
    if (htmlImageMatch) {
      const imageUrl = htmlImageMatch[1].trim();
      // Return the image URL if it's a valid non-empty string
      if (imageUrl && imageUrl.length > 0) {
        return imageUrl;
      }
    }
  }
  
  return null;
}

export function getAllCategories(): string[] {
  const posts = getSortedPostsData();
  const categories = new Set<string>();
  
  posts.forEach(post => {
    if (post.category) {
      categories.add(post.category);
    }
  });
  
  return Array.from(categories).sort();
}

export function getAllTags(posts: readonly PostData[]): string[] {
  const tags = new Set<string>();
  
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => tags.add(tag));
    }
  });
  
  return Array.from(tags).sort();
}

export function getPostsByCategory(category: string): PostData[] {
  const posts = getSortedPostsData();
  return posts.filter(post => post.category === category);
}

export function getPostsByTag(tag: string): PostData[] {
  const posts = getSortedPostsData();
  return posts.filter(post => post.tags && post.tags.includes(tag));
}

export function getAdjacentPosts(currentSlug: string): { previous: PostData | null; next: PostData | null } {
  const posts = getSortedPostsData();
  const currentIndex = posts.findIndex(post => post.slug === currentSlug);
  
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }
  
  return {
    // With newest-first sorting, "previous" should point to the older post
    previous: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    // and "next" should point to the newer post
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}
