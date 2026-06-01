import Link from 'next/link';

interface TagBadgeProps {
  tag: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  basePath?: string;
}

export function TagBadge({ tag, size = 'sm', clickable = true, basePath = '/' }: TagBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  const baseClasses = `tag-badge inline-flex items-center gap-0.5 text-gray-500 dark:text-gray-500 ${sizeClasses[size]} transition-all duration-200 ease-out`;
  const interactiveClasses = clickable ? 'hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
      <span className="rounded-full bg-rose-50/70 px-1 text-rose-400 transition-colors duration-200 group-hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:group-hover:bg-rose-900/40">#</span>
      <span>{tag}</span>
    </span>
  );

  if (clickable) {
    return (
      <Link href={`${basePath}?tag=${encodeURIComponent(tag)}`} className="group">
        {badge}
      </Link>
    );
  }

  return badge;
}
