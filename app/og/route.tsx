import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { themeConfig } from '@/config/theme.config';

// Read once on the server; Korean rendering must not depend on a font CDN.
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

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = fitText(params.get('title') || themeConfig.site.title, 112);
  const description = fitText(params.get('description') || (params.has('title') ? '' : themeConfig.site.description), 116);
  const category = fitText(params.get('category') || (params.get('path')?.startsWith('/coding-test') ? 'PS' : 'DEV JOURNAL'), 28);
  const date = fitText(params.get('date') || '', 24);
  const site = fitText((params.get('site') || new URL(themeConfig.seo.siteUrl).host).replace(/^https?:\/\//, '').replace(/\/+$/, ''), 40);
  const tags = [...new Set((params.get('tags') || '').split(',').map(tag => tag.trim()).filter(Boolean))].slice(0, 3);
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
