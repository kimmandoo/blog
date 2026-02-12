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

const psDirectory = path.join(process.cwd(), 'posts', 'ps');

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface PSData {
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
}

// Helper function to recursively find all markdown files
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

export function getSortedPSData(): PSData[] {
  const fileNames = fs.existsSync(psDirectory) 
    ? getAllMarkdownFiles(psDirectory)
    : [];
  
  const allData = fileNames
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '').replace(/\\/g, '/');
      const fullPath = path.join(psDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      const readingTime = calculateReadingTime(matterResult.content);

      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || '',
        category: matterResult.data.category || '',
        tags: matterResult.data.tags || [],
        draft: matterResult.data.draft || false,
        readingTime,
        ...(matterResult.data as Omit<PSData, 'slug' | 'title' | 'date' | 'excerpt' | 'category' | 'tags' | 'draft' | 'readingTime'>),
      };
    })
    .filter(item => !item.draft);

  // Sort posts by date (newest first)
  // Convert dates to timestamps to handle both Date objects and string dates consistently
  return allData.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export function getAllPSSlugs() {
  const fileNames = fs.existsSync(psDirectory)
    ? getAllMarkdownFiles(psDirectory)
    : [];
  
  return fileNames
    .filter(fileName => {
      const fullPath = path.join(psDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return !matterResult.data.draft;
    })
    .map(fileName => {
      return {
        slug: fileName.replace(/\.md$/, '').replace(/\\/g, '/'),
      };
    });
}

export async function getPSData(slug: string): Promise<PSData> {
  const fullPath = path.join(psDirectory, `${slug}.md`);
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
    category: matterResult.data.category || '',
    tags: matterResult.data.tags || [],
    draft: matterResult.data.draft || false,
    toc,
    readingTime,
    ...(matterResult.data as Omit<PSData, 'slug' | 'title' | 'date' | 'content' | 'excerpt' | 'category' | 'tags' | 'draft' | 'toc' | 'readingTime'>),
  };
}

// Helper function to extract TOC from markdown content
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

export function getAdjacentPS(currentSlug: string): { previous: PSData | null; next: PSData | null } {
  const items = getSortedPSData();
  const currentIndex = items.findIndex(item => item.slug === currentSlug);
  
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }
  
  return {
    previous: currentIndex > 0 ? items[currentIndex - 1] : null,
    next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
  };
}
