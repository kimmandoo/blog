import Link from 'next/link';

interface CategoryBadgeProps {
  category: string;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  basePath?: string;
}

export function CategoryBadge({ category, size = 'md', clickable = true, basePath = '/' }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const baseClasses = `category-badge inline-flex items-center font-medium rounded-full border border-gray-200/80 bg-white/70 dark:border-gray-800 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 ${sizeClasses[size]} transition-all duration-200 ease-out`;
  const interactiveClasses = clickable ? 'hover:bg-rose-50/70 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900/60 hover:text-rose-700 dark:hover:text-rose-200 cursor-pointer' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
      {category}
    </span>
  );

  if (clickable) {
    return (
      <Link href={`${basePath}?category=${encodeURIComponent(category)}`} className="group">
        {badge}
      </Link>
    );
  }

  return badge;
}
