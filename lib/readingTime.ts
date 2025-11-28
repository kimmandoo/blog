/**
 * Calculate reading time for a given text
 * Based on average reading speed of 200 words per minute for Korean/mixed content
 */

// Constants for reading time calculation
const WORDS_PER_MINUTE = 200;
const KOREAN_CHAR_WEIGHT = 0.3; // Each Korean character counts as ~0.3 words
const KOREAN_UNICODE_RANGE = /[\uAC00-\uD7AF]/g;

export function calculateReadingTime(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Remove code blocks
  const textWithoutCode = text.replace(/```[\s\S]*?```/g, '');
  // Count words (handles both English and Korean)
  const words = textWithoutCode.trim().split(/\s+/).length;
  // Korean characters count (each character roughly equals 0.3 words)
  const koreanChars = (textWithoutCode.match(KOREAN_UNICODE_RANGE) || []).length;
  
  // Adjust word count: treat Korean chars as weighted words
  const adjustedWords = words + (koreanChars * KOREAN_CHAR_WEIGHT);
  
  // Calculate reading time in minutes
  const minutes = Math.ceil(adjustedWords / WORDS_PER_MINUTE);
  
  return Math.max(1, minutes);
}

/**
 * Format reading time as a human-readable string
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
