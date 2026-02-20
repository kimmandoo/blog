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

  // Ultra-minimal modern style - text-based with subtle hover
  const baseClasses = `tag-badge inline-flex items-center text-gray-500 dark:text-gray-500 ${sizeClasses[size]} transition-all duration-200 ease-out`;
  const interactiveClasses = clickable ? 'hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
      <span className="opacity-60">#</span>
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
