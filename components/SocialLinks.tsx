'use client';

import { themeConfig } from '@/config/theme.config';

export function SocialLinks() {
  const { github, linkedin, medium } = themeConfig.socialLinks;

  const links = [
    {
      name: 'GitHub',
      url: github,
      icon: (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.63 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: linkedin,
      icon: (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19 18.75h-2.95v-4.64c0-1.11-.02-2.53-1.54-2.53-1.55 0-1.79 1.21-1.79 2.45v4.72H9.77V9.2h2.83v1.3h.04c.4-.75 1.36-1.54 2.79-1.54 2.98 0 3.57 1.96 3.57 4.51v5.28Z" />
        </svg>
      ),
    },
    {
      name: 'Medium',
      url: medium,
      icon: (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <circle cx="6.5" cy="12" r="6" />
          <ellipse cx="16.25" cy="12" rx="3" ry="5.65" />
          <ellipse cx="22" cy="12" rx="1.25" ry="5" />
        </svg>
      ),
    },
  ];

  // Filter out links without URLs
  const activeLinks = links.filter(link => link.url);

  if (activeLinks.length === 0) {
    return null;
  }

  return (
    <div className="social-links">
      {activeLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          title={link.name}
          aria-label={link.name}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
