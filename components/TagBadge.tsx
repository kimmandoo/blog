import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';

interface TagBadgeProps {
  tag: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function TagBadge({ tag, size = 'sm', clickable = true }: TagBadgeProps) {
  const { style, hoverStyle } = themeConfig.taxonomy.tags;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const badge = (
    <span
      className={`inline-flex items-center font-medium rounded-full ${style} ${sizeClasses[size]} ${clickable ? hoverStyle : ''} transition-colors`}
    >
      <span className="mr-1">#</span>
      {tag}
    </span>
  );

  if (clickable) {
    return (
      <Link href={`/?tag=${encodeURIComponent(tag)}`}>
        {badge}
      </Link>
    );
  }

  return badge;
}
