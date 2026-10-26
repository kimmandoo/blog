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

  const baseClasses = `category-badge inline-flex items-center ${sizeClasses[size]}`;
  const interactiveClasses = clickable ? 'taxonomy-link' : '';

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
