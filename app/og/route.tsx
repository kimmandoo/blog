import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

const MAX_TAGS_DISPLAY = 4;
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const TITLE_LENGTH_THRESHOLD_MEDIUM = 34;
const TITLE_LENGTH_THRESHOLD_LONG = 58;
const TITLE_LENGTH_THRESHOLD_EXTRA_LONG = 78;
const DESCRIPTION_LENGTH_THRESHOLD = 88;
const fontFamily = "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif";

const editorialOgPalette = {
  background: '#fffefe',
  backgroundSoft: '#fff7f8',
  text: '#111827',
  muted: '#6b7280',
  faint: '#9ca3af',
  border: '#e5e7eb',
  borderSoft: 'rgba(229, 231, 235, 0.72)',
  rose: '#fb7185',
  roseStrong: '#e11d48',
  roseSoft: '#fff1f2',
  roseBorder: '#fecdd3',
  roseText: '#be123c',
};

function getTitleFontSize(title: string) {
  if (title.length > TITLE_LENGTH_THRESHOLD_EXTRA_LONG) {
    return '42px';
  }

  if (title.length > TITLE_LENGTH_THRESHOLD_LONG) {
    return '50px';
  }

  if (title.length > TITLE_LENGTH_THRESHOLD_MEDIUM) {
    return '58px';
  }

  return '66px';
}

function getDisplayUrl(site: string, path: string) {
  const normalizedSite = site.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const normalizedPath = path ? `/${path.replace(/^\/+/, '')}` : '';
  const displayUrl = `${normalizedSite}${normalizedPath}`;

  return displayUrl.length > 82 ? `${displayUrl.slice(0, 79)}...` : displayUrl;
}

function getDisplayDescription(description: string) {
  const normalizedDescription = description.replace(/\s+/g, ' ').trim();

  if (!normalizedDescription) {
    return '작게 기록해두는 개발 노트';
  }

  return normalizedDescription.length > DESCRIPTION_LENGTH_THRESHOLD
    ? `${normalizedDescription.slice(0, DESCRIPTION_LENGTH_THRESHOLD - 1).trim()}…`
    : normalizedDescription;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'mandoo.log';
  const description = searchParams.get('description') || '';
  const category = searchParams.get('category') || '';
  const date = searchParams.get('date') || '';
  const tags = searchParams.get('tags') || '';
  const site = searchParams.get('site') || request.nextUrl.host || 'kimmandoo.vercel.app';
  const path = searchParams.get('path') || '';

  const tagList = tags
    ? tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, MAX_TAGS_DISPLAY)
    : [];
  const displayUrl = getDisplayUrl(site, path);
  const displayDescription = getDisplayDescription(description);
  const articleSheet = {
    position: 'absolute' as const,
    left: 58,
    top: 54,
    width: '1084px',
    height: '522px',
    display: 'flex',
    overflow: 'hidden',
    borderRadius: '8px',
    border: `1px solid ${editorialOgPalette.border}`,
    background: 'rgba(255, 255, 255, 0.96)',
    boxShadow: '0 24px 64px rgba(15, 23, 42, 0.08)',
  };
  const accentRule = {
    width: '88px',
    height: '3px',
    background: editorialOgPalette.roseStrong,
    borderRadius: '999px',
  };
  const excerptLead = {
    position: 'absolute' as const,
    left: 46,
    bottom: 100,
    width: '706px',
    height: '92px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  };
  const metadataRail = {
    position: 'absolute' as const,
    right: 46,
    top: 118,
    width: '248px',
    height: '318px',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px 0 24px 30px',
    borderLeft: `1px solid ${editorialOgPalette.borderSoft}`,
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${editorialOgPalette.background} 0%, #ffffff 54%, ${editorialOgPalette.backgroundSoft} 100%)`,
          color: editorialOgPalette.text,
          fontFamily,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '18px',
            background: editorialOgPalette.roseSoft,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            height: '18px',
            background: 'rgba(255, 241, 242, 0.62)',
          }}
        />

        <div style={articleSheet}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '7px',
              height: '100%',
              display: 'flex',
              background: `linear-gradient(180deg, ${editorialOgPalette.rose} 0%, ${editorialOgPalette.roseStrong} 100%)`,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 46,
              right: 46,
              top: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '9px',
                  height: '9px',
                  borderRadius: '999px',
                  background: editorialOgPalette.rose,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  color: editorialOgPalette.text,
                  fontSize: '25px',
                  fontWeight: 850,
                  letterSpacing: '0',
                }}
              >
                mandoo.log
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '30px',
                padding: '0 12px',
                borderRadius: '999px',
                border: `1px solid ${editorialOgPalette.roseBorder}`,
                background: editorialOgPalette.roseSoft,
                color: editorialOgPalette.roseText,
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0',
              }}
            >
              POST
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 46,
              right: 46,
              top: 82,
              height: '1px',
              display: 'flex',
              background: editorialOgPalette.borderSoft,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 46,
              top: 122,
              display: 'flex',
            }}
          >
            <div style={accentRule} />
          </div>

          <div
            style={{
              position: 'absolute',
              left: 46,
              top: 146,
              width: '708px',
              display: 'flex',
              color: editorialOgPalette.text,
              fontSize: getTitleFontSize(title),
              fontWeight: 850,
              lineHeight: 1.14,
              letterSpacing: '0',
              wordBreak: 'keep-all',
            }}
          >
            {title}
          </div>

          <div style={excerptLead}>
            <div
              style={{
                display: 'flex',
                width: '3px',
                height: '66px',
                borderRadius: '999px',
                background: editorialOgPalette.rose,
              }}
            />
            <div
              style={{
                display: 'flex',
                width: '650px',
                color: editorialOgPalette.muted,
                fontSize: '21px',
                fontWeight: 600,
                lineHeight: 1.46,
                wordBreak: 'keep-all',
              }}
            >
              {displayDescription}
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 46,
              bottom: 38,
              display: 'flex',
              color: editorialOgPalette.faint,
              fontSize: '15px',
              fontWeight: 650,
              letterSpacing: '0',
            }}
          >
            {displayUrl}
          </div>

          <div style={metadataRail}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: editorialOgPalette.faint,
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0',
                }}
              >
                CATEGORY
              </div>
              <div
                style={{
                  display: 'flex',
                  color: editorialOgPalette.text,
                  fontSize: '31px',
                  fontWeight: 850,
                  lineHeight: 1.08,
                  wordBreak: 'keep-all',
                }}
              >
                {category || 'POST'}
              </div>
            </div>

            {date ? (
              <div
                style={{
                  display: 'flex',
                  marginTop: '28px',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    color: editorialOgPalette.faint,
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0',
                  }}
                >
                  DATE
                </div>
                <div
                  style={{
                    display: 'flex',
                    color: editorialOgPalette.muted,
                    fontSize: '18px',
                    fontWeight: 750,
                  }}
                >
                  {date}
                </div>
              </div>
            ) : null}

            {tagList.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: '30px',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    color: editorialOgPalette.faint,
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0',
                  }}
                >
                  TAGS
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {tagList.map((tag) => (
                    <div
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '31px',
                        padding: '0 11px',
                        borderRadius: '999px',
                        border: `1px solid ${editorialOgPalette.roseBorder}`,
                        background: editorialOgPalette.roseSoft,
                        color: editorialOgPalette.roseText,
                        fontSize: '14px',
                        fontWeight: 750,
                      }}
                    >
                      #{tag}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    }
  );
}
