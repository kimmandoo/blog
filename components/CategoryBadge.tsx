import Link from 'next/link';
import { themeConfig } from '@/config/theme.config';

interface CategoryBadgeProps {
  category: string;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function CategoryBadge({ category, index = 0, size = 'md', clickable = true }: CategoryBadgeProps) {
  const colors = themeConfig.taxonomy.categories.colors;
  const colorClass = colors[index % colors.length];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const badge = (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${colorClass} ${sizeClasses[size]} transition-colors`}
    >
      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      {category}
    </span>
  );

  if (clickable) {
    return (
      <Link href={`/?category=${encodeURIComponent(category)}`}>
        {badge}
      </Link>
    );
  }

  return badge;
}
