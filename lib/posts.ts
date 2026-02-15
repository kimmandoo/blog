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

const postsDirectory = path.join(process.cwd(), 'posts');

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface PostData {
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

export function getSortedPostsData(): PostData[] {
  // Get all markdown files recursively
  const fileNames = fs.existsSync(postsDirectory) 
    ? getAllMarkdownFiles(postsDirectory)
    : [];
  
  const allPostsData = fileNames
    .map(fileName => {
      // Remove ".md" from file name to get slug (keep folder structure)
      const slug = fileName.replace(/\.md$/, '').replace(/\\/g, '/');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);
      
      // Calculate reading time
      const readingTime = calculateReadingTime(matterResult.content);

      // Combine the data with the slug
      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || '',
        category: matterResult.data.category || '',
        tags: matterResult.data.tags || [],
        draft: matterResult.data.draft || false,
        readingTime,
        ...(matterResult.data as Omit<PostData, 'slug' | 'title' | 'date' | 'excerpt' | 'category' | 'tags' | 'draft' | 'readingTime'>),
      };
    })
    // Filter out draft posts and separated sections
    .filter(post => !post.draft && post.category !== 'PS' && post.category !== 'Rust');

  // Sort posts by date (newest first)
  // Convert dates to timestamps to handle both Date objects and string dates consistently
  return allPostsData.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.existsSync(postsDirectory)
    ? getAllMarkdownFiles(postsDirectory)
    : [];
  
  return fileNames
    .filter(fileName => {
      // Check if post is draft or separated section post
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return !matterResult.data.draft && matterResult.data.category !== 'PS' && matterResult.data.category !== 'Rust';
    })
    .map(fileName => {
      return {
        slug: fileName.replace(/\.md$/, '').replace(/\\/g, '/'),
      };
    });
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

  // Extract TOC items from markdown content
  const toc = extractTOC(matterResult.content);
  
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
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the slug and contentHtml
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
    firstImage,
    ...(matterResult.data as Omit<PostData, 'slug' | 'title' | 'date' | 'content' | 'excerpt' | 'category' | 'tags' | 'draft' | 'toc' | 'readingTime' | 'firstImage'>),
  };
}

// Helper function to extract TOC from markdown content
function extractTOC(content: string): TOCItem[] {
  const toc: TOCItem[] = [];
  const lines = content.split('\n');
  let codeBlockFence: string | null = null;
  const slugger = new GithubSlugger();
  
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
    
    // Skip headings inside code blocks
    if (codeBlockFence !== null) {
      continue;
    }
    
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      // Use github-slugger to match rehype-slug's ID generation
      const id = slugger.slug(text);
      
      toc.push({ id, text, level });
    }
  }
  
  return toc;
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

export function getAllTags(): string[] {
  const posts = getSortedPostsData();
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
    // Previous post (newer, lower index)
    previous: currentIndex > 0 ? posts[currentIndex - 1] : null,
    // Next post (older, higher index)
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  };
}
