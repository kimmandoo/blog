import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export function getSortedPostsData(): PostData[] {
  // Get file names under /posts
  const fileNames = fs.existsSync(postsDirectory) 
    ? fs.readdirSync(postsDirectory)
    : [];
  
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the slug
      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || '',
        category: matterResult.data.category || '',
        tags: matterResult.data.tags || [],
        ...(matterResult.data as Omit<PostData, 'slug' | 'title' | 'date' | 'excerpt' | 'category' | 'tags'>),
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.existsSync(postsDirectory)
    ? fs.readdirSync(postsDirectory)
    : [];
  
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      return {
        slug: fileName.replace(/\.md$/, ''),
      };
    });
}

export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSanitize)
    .use(rehypeStringify)
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
    ...(matterResult.data as Omit<PostData, 'slug' | 'title' | 'date' | 'content' | 'excerpt' | 'category' | 'tags'>),
  };
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
