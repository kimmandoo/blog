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
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const baseClasses = `category-badge inline-flex items-center font-bold rounded-xl ${colorClass} ${sizeClasses[size]} backdrop-blur-md border border-white/30 dark:border-white/20 shadow-lg transition-all duration-300 ease-out`;
  const interactiveClasses = clickable ? 'hover:shadow-2xl hover:scale-[1.05] hover:-translate-y-0.5 active:scale-95 cursor-pointer group' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses} relative overflow-hidden`}>
      {/* Animated shine effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></span>
      <svg className="w-4 h-4 opacity-90 group-hover:opacity-100 relative transition-opacity" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <span className="relative font-bold tracking-wide">{category}</span>
    </span>
  );

  if (clickable) {
    return (
      <Link href={`/?category=${encodeURIComponent(category)}`} className="group">
        {badge}
      </Link>
    );
  }

  return badge;
}
