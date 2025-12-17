import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import { calculateReadingTime } from './readingTime';
import GithubSlugger from 'github-slugger';

const leetcodeDirectory = path.join(process.cwd(), 'posts', 'leetcode');

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface LeetCodeData {
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

export function getSortedLeetCodeData(): LeetCodeData[] {
  const fileNames = fs.existsSync(leetcodeDirectory) 
    ? getAllMarkdownFiles(leetcodeDirectory)
    : [];
  
  const allData = fileNames
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '').replace(/\\/g, '/');
      const fullPath = path.join(leetcodeDirectory, fileName);
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
        ...(matterResult.data as Omit<LeetCodeData, 'slug' | 'title' | 'date' | 'excerpt' | 'category' | 'tags' | 'draft' | 'readingTime'>),
      };
    })
    .filter(item => !item.draft);

  return allData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllLeetCodeSlugs() {
  const fileNames = fs.existsSync(leetcodeDirectory)
    ? getAllMarkdownFiles(leetcodeDirectory)
    : [];
  
  return fileNames
    .filter(fileName => {
      const fullPath = path.join(leetcodeDirectory, fileName);
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

export async function getLeetCodeData(slug: string): Promise<LeetCodeData> {
  const fullPath = path.join(leetcodeDirectory, `${slug}.md`);
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
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeKatex)
    .use(rehypeStringify)
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
    ...(matterResult.data as Omit<LeetCodeData, 'slug' | 'title' | 'date' | 'content' | 'excerpt' | 'category' | 'tags' | 'draft' | 'toc' | 'readingTime'>),
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

export function getAdjacentLeetCode(currentSlug: string): { previous: LeetCodeData | null; next: LeetCodeData | null } {
  const items = getSortedLeetCodeData();
  const currentIndex = items.findIndex(item => item.slug === currentSlug);
  
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }
  
  return {
    previous: currentIndex > 0 ? items[currentIndex - 1] : null,
    next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
  };
}
