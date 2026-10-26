'use client';

import { themeConfig } from '@/config/theme.config';

export function SocialLinks() {
  const { github, linkedin, medium } = themeConfig.socialLinks;

  const links = [
    {
      name: 'GitHub',
      url: github,
    },
    {
      name: 'LinkedIn',
      url: linkedin,
    },
    {
      name: 'Medium',
      url: medium,
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
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
