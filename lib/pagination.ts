export const DEFAULT_POSTS_PER_PAGE = 10;

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function parsePageParam(value?: string | string[] | null): number {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue || !/^\d+$/.test(rawValue)) {
    return 1;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return parsed > 0 ? parsed : 1;
}

export function paginateItems<T>(
  items: T[],
  requestedPage: number,
  pageSize: number = DEFAULT_POSTS_PER_PAGE,
): PaginationResult<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(requestedPage)), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;

  return {
    items: items.slice(startIndex, startIndex + safePageSize),
    currentPage,
    totalPages,
    totalItems,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}
