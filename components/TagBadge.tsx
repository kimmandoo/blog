import Link from 'next/link';

interface TagBadgeProps {
  tag: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function TagBadge({ tag, size = 'sm', clickable = true }: TagBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  // Minimal style
  const baseClasses = `tag-badge inline-flex items-center font-medium rounded-md bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 ${sizeClasses[size]} border border-gray-200 dark:border-gray-700 transition-all duration-200 ease-out`;
  const interactiveClasses = clickable ? 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
      <span className="text-gray-400 dark:text-gray-500">#</span>
      <span>{tag}</span>
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
