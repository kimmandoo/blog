import { format } from 'date-fns';

export type FrontmatterDate = string | Date | null | undefined;

const RAW_DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const RAW_DATE_TIME_REGEX = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)$/;

interface RawDateParts {
  year: string;
  month: string;
  day: string;
  hour?: string;
  minute?: string;
}

interface FormatDateOptions {
  dateFormat?: string;
  dateTimeFormat?: string;
  fallback?: string;
}

function extractRawDateParts(value: string): RawDateParts | null {
  const trimmed = value.trim();
  const dateOnlyMatch = trimmed.match(RAW_DATE_ONLY_REGEX);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return { year, month, day };
  }

  const dateTimeMatch = trimmed.match(RAW_DATE_TIME_REGEX);
  if (dateTimeMatch) {
    const [, year, month, day, hour, minute] = dateTimeMatch;
    return { year, month, day, hour, minute };
  }

  return null;
}

function applyPattern(pattern: string, parts: RawDateParts): string {
  return pattern
    .replace(/yyyy/g, parts.year)
    .replace(/MM/g, parts.month)
    .replace(/dd/g, parts.day)
    .replace(/HH/g, parts.hour ?? '00')
    .replace(/mm/g, parts.minute ?? '00');
}

export function normalizeFrontmatterDate(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const hasUtcTime =
      value.getUTCHours() !== 0 ||
      value.getUTCMinutes() !== 0 ||
      value.getUTCSeconds() !== 0 ||
      value.getUTCMilliseconds() !== 0;

    return hasUtcTime ? value.toISOString() : value.toISOString().slice(0, 10);
  }

  return new Date().toISOString();
}

export function parseDateValue(value: FrontmatterDate): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  const normalized = RAW_DATE_ONLY_REGEX.test(trimmed)
    ? `${trimmed}T00:00:00`
    : trimmed.replace(' ', 'T');

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function hasExplicitTime(value: FrontmatterDate): boolean {
  if (!value) {
    return false;
  }

  if (value instanceof Date) {
    return (
      value.getUTCHours() !== 0 ||
      value.getUTCMinutes() !== 0 ||
      value.getUTCSeconds() !== 0 ||
      value.getUTCMilliseconds() !== 0
    );
  }

  return RAW_DATE_TIME_REGEX.test(value.trim());
}

export function formatDisplayDate(
  value: FrontmatterDate,
  options: FormatDateOptions = {}
): string {
  const {
    dateFormat = 'yyyy.MM.dd',
    dateTimeFormat = 'yyyy.MM.dd HH:mm',
    fallback = '',
  } = options;

  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    const rawParts = extractRawDateParts(value);
    if (rawParts) {
      return applyPattern(rawParts.hour ? dateTimeFormat : dateFormat, rawParts);
    }
  }

  const parsed = parseDateValue(value);
  if (!parsed) {
    return fallback;
  }

  return format(parsed, hasExplicitTime(value) ? dateTimeFormat : dateFormat);
}

export function toMetadataDate(value: FrontmatterDate): string | undefined {
  const parsed = parseDateValue(value);
  return parsed?.toISOString();
}
