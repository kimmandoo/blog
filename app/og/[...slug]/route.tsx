import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { themeConfig } from '@/config/theme.config';
import { formatDisplayDate } from '@/lib/date';
import { getSortedPostsData, getSortedPostsDataByCategory } from '@/lib/posts';

export const dynamic = 'force-static';
export const dynamicParams = false;

type ImageData = {
  title: string;
  excerpt?: string;
  category?: string;
  date?: string;
  tags?: string[];
};

const images = new Map<string, ImageData>([
  ['index.png', { title: themeConfig.site.title, excerpt: themeConfig.site.description }],
  ['coding-test.png', { title: 'PS', excerpt: '코테 노트', category: 'PS' }],
]);

for (const post of getSortedPostsData()) {
  images.set(`posts/${post.slug}.png`, post);
}
for (const post of getSortedPostsDataByCategory('PS')) {
  images.set(`coding-test/${post.slug}.png`, post);
}

export function generateStaticParams() {
  return Array.from(images.keys(), (path) => ({ slug: path.split('/') }));
}

// Read once at build time; Korean rendering must not depend on a font CDN.
const font = readFile(join(process.cwd(), 'public/fonts/IBMPlexSansKR-Medium.ttf'));
const palette = { background: '#fafafa', text: '#202124', muted: '#707278', border: '#e7e7e9', surface: '#f0f0f2' };

// Bound visual width, not UTF-16 length: Korean glyphs are wider than Latin text.
function textWidth(text: string) {
  return Array.from(text).reduce((width, char) => width + (/[^\x00-\x7F]/.test(char) ? 2 : /[MW@]/.test(char) ? 1.8 : 1), 0);
}

function fitText(value: string, limit: number) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (textWidth(text) <= limit) return text;
  let result = '';
  let width = 0;
  for (const char of text) {
    width += textWidth(char);
    if (width > limit - 2) break;
    result += char;
  }
  return `${result.trimEnd()}…`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const image = images.get(slug.join('/'));
  if (!image) return new Response('Not found', { status: 404 });

  const title = fitText(image.title, 112);
  const description = fitText(image.excerpt || '', 116);
  const category = fitText(image.category || 'DEV JOURNAL', 28);
  const date = fitText(image.date ? formatDisplayDate(image.date) : '', 24);
  const site = fitText(new URL(themeConfig.seo.siteUrl).host, 40);
  const tags = [...new Set((image.tags || []).map(tag => tag.trim()).filter(Boolean))].slice(0, 3);
  const titleSize = textWidth(title) > 88 ? 46 : textWidth(title) > 56 ? 54 : 64;

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', padding: '46px 64px', background: palette.background, color: palette.text, fontFamily: 'IBM Plex Sans KR', fontWeight: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 26, borderBottom: `1px solid ${palette.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 25 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: palette.text }} />
          {themeConfig.site.title}
        </div>
        <div style={{ display: 'flex', color: palette.muted, fontSize: 19 }}>{category}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <div style={{ fontSize: titleSize, lineHeight: 1.3, letterSpacing: '-1.5px', wordBreak: 'break-word' }}>{title}</div>
        {description && <div style={{ marginTop: 24, fontSize: 25, lineHeight: 1.5, color: palette.muted, wordBreak: 'break-word' }}>{description}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: `1px solid ${palette.border}`, height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {tags.length ? tags.map(tag => <div key={tag} style={{ display: 'flex', padding: '6px 12px', borderRadius: 6, background: palette.surface, color: palette.muted, fontSize: 17 }}>#{fitText(tag, 22)}</div>) : <div style={{ color: palette.muted, fontSize: 19 }}>{site}</div>}
        </div>
        <div style={{ display: 'flex', color: palette.muted, fontSize: 19 }}>{date || (tags.length ? site : '글과 코드의 기록')}</div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: [{ name: 'IBM Plex Sans KR', data: await font, weight: 500, style: 'normal' }] },
  );
}
