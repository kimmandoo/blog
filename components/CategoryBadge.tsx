import Link from 'next/link';

interface CategoryBadgeProps {
  category: string;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function CategoryBadge({ category, size = 'md', clickable = true }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2',
  };

  // Minimal style with subtle colors
  const baseClasses = `category-badge inline-flex items-center font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${sizeClasses[size]} border border-gray-200 dark:border-gray-700 transition-all duration-200 ease-out`;
  const interactiveClasses = clickable ? 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
      <span>{category}</span>
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
