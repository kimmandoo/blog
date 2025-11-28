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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const baseClasses = `inline-flex items-center font-medium rounded-md ${colorClass} ${sizeClasses[size]} ${themeConfig.animations.transition}`;
  const interactiveClasses = clickable ? 'hover:opacity-80 cursor-pointer' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
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
