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
import GithubSlugger from 'github-slugger';

const rustDirectory = path.join(process.cwd(), 'rust');
const rustPostsDirectory = path.join(rustDirectory, 'posts');

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface RustData {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  toc?: TOCItem[];
  draft?: boolean;
  readingTime?: number;
  order?: number;
  level?: string;
}

function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

export function getSortedRustData(): RustData[] {
  const fileNames = fs.existsSync(rustPostsDirectory)
    ? getAllMarkdownFiles(rustPostsDirectory)
    : [];

  const allData = fileNames
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '').replace(/\\/g, '/');
      const fullPath = path.join(rustPostsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      const readingTime = calculateReadingTime(matterResult.content);

      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || '',
        category: matterResult.data.category || 'Rust',
        tags: matterResult.data.tags || [],
        draft: matterResult.data.draft || false,
        order: matterResult.data.order,
        level: matterResult.data.level,
        readingTime,
        ...(matterResult.data as Omit<RustData, 'slug' | 'title' | 'date' | 'excerpt' | 'category' | 'tags' | 'draft' | 'readingTime' | 'order' | 'level'>),
      };
    })
    .filter(item => !item.draft);

  return allData.sort((a, b) => {
    const orderA = Number.isFinite(a.order) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(b.order) ? (b.order as number) : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export function getAllRustSlugs() {
  const fileNames = fs.existsSync(rustPostsDirectory)
    ? getAllMarkdownFiles(rustPostsDirectory)
    : [];

  return fileNames
    .filter(fileName => {
      const fullPath = path.join(rustPostsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return !matterResult.data.draft;
    })
    .map(fileName => ({
      slug: fileName.replace(/\.md$/, '').replace(/\\/g, '/'),
    }));
}

export async function getRustData(slug: string): Promise<RustData> {
  const fullPath = path.join(rustPostsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  if (matterResult.data.draft) {
    throw new Error('Post not found');
  }

  const toc = extractTOC(matterResult.content);
  const readingTime = calculateReadingTime(matterResult.content);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkEmoji)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    content: contentHtml,
    title: matterResult.data.title || slug,
    date: matterResult.data.date || new Date().toISOString(),
    excerpt: matterResult.data.excerpt || '',
    category: matterResult.data.category || 'Rust',
    tags: matterResult.data.tags || [],
    draft: matterResult.data.draft || false,
    order: matterResult.data.order,
    level: matterResult.data.level,
    toc,
    readingTime,
    ...(matterResult.data as Omit<RustData, 'slug' | 'title' | 'date' | 'content' | 'excerpt' | 'category' | 'tags' | 'draft' | 'order' | 'level' | 'toc' | 'readingTime'>),
  };
}

function extractTOC(content: string): TOCItem[] {
  const toc: TOCItem[] = [];
  const lines = content.split('\n');
  let codeBlockFence: string | null = null;
  const slugger = new GithubSlugger();

  for (const line of lines) {
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

    if (codeBlockFence !== null) {
      continue;
    }

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugger.slug(text);

      toc.push({ id, text, level });
    }
  }

  return toc;
}

export function getAllRustCategories(): string[] {
  const items = getSortedRustData();
  const categories = new Set<string>();

  items.forEach(item => {
    if (item.category) {
      categories.add(item.category);
    }
  });

  return Array.from(categories).sort();
}

export function getAllRustTags(): string[] {
  const items = getSortedRustData();
  const tags = new Set<string>();

  items.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
}

export function getAdjacentRust(currentSlug: string): { previous: RustData | null; next: RustData | null } {
  const items = getSortedRustData();
  const currentIndex = items.findIndex(item => item.slug === currentSlug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? items[currentIndex - 1] : null,
    next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
  };
}
