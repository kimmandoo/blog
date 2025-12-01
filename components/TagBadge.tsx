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
    sm: 'text-xs px-3 py-1.5 gap-1',
    md: 'text-sm px-4 py-2 gap-1.5',
    lg: 'text-base px-5 py-2.5 gap-2',
  };

  const baseClasses = `tag-badge inline-flex items-center font-semibold rounded-lg ${style} ${sizeClasses[size]} backdrop-blur-md border border-gray-300/60 dark:border-gray-600/60 shadow-md transition-all duration-300 ease-out`;
  const interactiveClasses = clickable ? `${hoverStyle} hover:shadow-xl hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95 cursor-pointer` : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses} relative group overflow-hidden`}>
      {/* Animated gradient background on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-gray-200/0 via-gray-300/40 to-gray-200/0 dark:from-gray-700/0 dark:via-gray-600/40 dark:to-gray-700/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></span>
      <span className="text-gray-500 dark:text-gray-400 font-bold text-[0.9em] relative">#</span>
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
