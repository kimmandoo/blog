import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

const MAX_TAGS_DISPLAY = 4;
const TITLE_LENGTH_THRESHOLD = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'mandoo.log';
  const category = searchParams.get('category') || '';
  const date = searchParams.get('date') || '';
  const tags = searchParams.get('tags') || '';

  const tagList = tags ? tags.split(',').slice(0, MAX_TAGS_DISPLAY) : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {category ? (
            <div
              style={{
                display: 'flex',
                padding: '8px 20px',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#a5b4fc',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          ) : null}
          {date ? (
            <div style={{ display: 'flex', color: '#6b7280', fontSize: '20px' }}>
              {date}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: title.length > TITLE_LENGTH_THRESHOLD ? '48px' : '56px',
              fontWeight: 800,
              color: '#f9fafb',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>

          {tagList.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {tagList.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    padding: '6px 14px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#9ca3af',
                    fontSize: '16px',
                  }}
                >
                  #{tag.trim()}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              fontWeight: 700,
              color: '#6b7280',
            }}
          >
            mandoo.log
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 800,
            }}
          >
            M
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
