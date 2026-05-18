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

  const baseClasses = `category-badge inline-flex items-center font-medium rounded-full border border-rose-200/70 bg-orange-50/70 dark:border-rose-900/50 dark:bg-rose-950/20 text-gray-600 dark:text-gray-300 ${sizeClasses[size]} transition-all duration-200 ease-out`;
  const interactiveClasses = clickable ? 'hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-700 dark:hover:text-rose-200 cursor-pointer' : '';

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
