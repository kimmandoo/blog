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
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const badge = (
    <span
      className={`tag-badge inline-flex items-center font-medium rounded-xl ${style} ${sizeClasses[size]} ${clickable ? hoverStyle : ''} backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 ease-out cursor-pointer`}
    >
      <span className="text-gray-400 dark:text-gray-500 mr-1 font-normal">#</span>
      <span className="relative">{tag}</span>
    </span>
  );

  if (clickable) {
    return (
      <Link href={`/?tag=${encodeURIComponent(tag)}`} className="group">
        {badge}
      </Link>
    );
  }

  return badge;
}
