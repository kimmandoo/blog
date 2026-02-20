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

  // Ultra-minimal modern style - clean pill shape with subtle background
  const baseClasses = `category-badge inline-flex items-center font-medium rounded-full bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 ${sizeClasses[size]} transition-all duration-200 ease-out`;
  const interactiveClasses = clickable ? 'hover:bg-gray-200/80 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer' : '';

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
