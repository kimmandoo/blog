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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const baseClasses = `inline-flex items-center font-medium rounded-md ${style} ${sizeClasses[size]} ${themeConfig.animations.transition}`;
  const interactiveClasses = clickable ? `${hoverStyle} cursor-pointer` : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
      <span className="opacity-50 mr-0.5">#</span>{tag}
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
