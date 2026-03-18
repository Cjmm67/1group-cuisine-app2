/**
 * YouTube utilities for 1-CUISINESG video imports
 */

/** Extract 11-char YouTube video ID from any URL format */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // Bare ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  return null;
}

/** Generate YouTube thumbnail URL */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault' = 'maxresdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/** Generate YouTube embed URL with sensible defaults */
export function getYouTubeEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    ...(autoplay ? { autoplay: '1' } : {}),
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}
