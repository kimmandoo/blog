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

  const baseClasses = `tag-badge inline-flex items-center ${sizeClasses[size]}`;
  const interactiveClasses = clickable ? 'taxonomy-link' : '';

  const badge = (
    <span className={`${baseClasses} ${interactiveClasses}`}>
      <span>#{tag}</span>
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
