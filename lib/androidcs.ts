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

const androidcsDirectory = path.join(process.cwd(), 'android-cs');
const androidcsPostsDirectory = path.join(androidcsDirectory, 'posts');
export const androidcsImagesDirectory = path.join(androidcsDirectory, 'images');

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface AndroidCSData {
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

// Helper function to recursively find all markdown files, excluding images directory
function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip images directory
    if (entry.isDirectory() && entry.name === 'images') {
      continue;
    }
    
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

export function getSortedAndroidCSData(): AndroidCSData[] {
  // Check for posts directory first, fallback to root android-cs directory
  const searchDirectory = fs.existsSync(androidcsPostsDirectory) 
    ? androidcsPostsDirectory 
    : androidcsDirectory;
    
  const fileNames = fs.existsSync(searchDirectory) 
    ? getAllMarkdownFiles(searchDirectory)
    : [];
  
  const allData = fileNames
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '').replace(/\\/g, '/');
      const fullPath = path.join(searchDirectory, fileName);
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
        ...(matterResult.data as Omit<AndroidCSData, 'slug' | 'title' | 'date' | 'excerpt' | 'category' | 'tags' | 'draft' | 'readingTime'>),
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

export function getAllAndroidCSSlugs() {
  // Check for posts directory first, fallback to root android-cs directory
  const searchDirectory = fs.existsSync(androidcsPostsDirectory) 
    ? androidcsPostsDirectory 
    : androidcsDirectory;
    
  const fileNames = fs.existsSync(searchDirectory)
    ? getAllMarkdownFiles(searchDirectory)
    : [];
  
  return fileNames
    .filter(fileName => {
      const fullPath = path.join(searchDirectory, fileName);
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

export async function getAndroidCSData(slug: string): Promise<AndroidCSData> {
  // Validate slug to prevent path traversal
  if (slug.includes('..') || path.isAbsolute(slug)) {
    throw new Error('Invalid slug');
  }
  
  // Check for posts directory first, fallback to root android-cs directory
  const searchDirectory = fs.existsSync(androidcsPostsDirectory) 
    ? androidcsPostsDirectory 
    : androidcsDirectory;
  
  const fullPath = path.join(searchDirectory, `${slug}.md`);
  
  // Verify the resolved path is still within search directory
  const resolvedPath = path.resolve(fullPath);
  const resolvedBaseDir = path.resolve(searchDirectory);
  if (!resolvedPath.startsWith(resolvedBaseDir)) {
    throw new Error('Invalid slug');
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  if (matterResult.data.draft) {
    throw new Error('Content not found');
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
    ...(matterResult.data as Omit<AndroidCSData, 'slug' | 'title' | 'date' | 'content' | 'excerpt' | 'category' | 'tags' | 'draft' | 'toc' | 'readingTime'>),
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

export function getAllAndroidCSCategories(): string[] {
  const items = getSortedAndroidCSData();
  const categories = new Set<string>();
  
  items.forEach(item => {
    if (item.category) {
      categories.add(item.category);
    }
  });
  
  return Array.from(categories).sort();
}

export function getAllAndroidCSTags(): string[] {
  const items = getSortedAndroidCSData();
  const tags = new Set<string>();
  
  items.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => tags.add(tag));
    }
  });
  
  return Array.from(tags).sort();
}
