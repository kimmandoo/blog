import type { PostData } from './posts';

export type PsFilters = {
  language?: string;
  tag?: string;
};

const languageLabels: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  java: 'Java',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  kotlin: 'Kotlin',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  swift: 'Swift',
  unclassified: '미분류',
};

export function normalizePsLanguage(language?: string): string {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return 'unclassified';
  if (normalized === 'c++') return 'cpp';
  if (normalized === 'c#') return 'csharp';
  return normalized;
}

export function getPsLanguageLabel(language?: string): string {
  const normalized = normalizePsLanguage(language);
  return Object.hasOwn(languageLabels, normalized) ? languageLabels[normalized] : normalized;
}

export function getPsArchiveHref({ language, tag }: PsFilters = {}): string {
  const params = new URLSearchParams();
  if (language?.trim()) params.set('language', normalizePsLanguage(language));
  if (tag?.trim()) params.set('tag', tag.trim());
  const query = params.toString();
  return query ? `/coding-test?${query}` : '/coding-test';
}

export function getPsArchive(posts: PostData[], filters: PsFilters = {}) {
  const publishedPosts = posts.filter((post) => post.category === 'PS' && !post.draft);
  const selectedLanguage = filters.language?.trim() ? normalizePsLanguage(filters.language) : '';
  const selectedTag = filters.tag?.trim() ?? '';
  const languageCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const post of publishedPosts) {
    const language = normalizePsLanguage(post.language);
    languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
    for (const tag of new Set(post.tags ?? [])) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return {
    selectedLanguage,
    selectedTag,
    total: publishedPosts.length,
    languages: Array.from(languageCounts, ([language, count]) => ({ language, count }))
      .sort((a, b) => {
        if (a.language === 'unclassified') return 1;
        if (b.language === 'unclassified') return -1;
        return a.language.localeCompare(b.language);
      }),
    tags: Array.from(tagCounts, ([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag)),
    posts: publishedPosts.filter((post) => (
      (!selectedLanguage || normalizePsLanguage(post.language) === selectedLanguage)
      && (!selectedTag || post.tags?.includes(selectedTag))
    )),
  };
}
