/**
 * Converts a relative or absolute image path to a full URL
 * If the path is already absolute (http:// or https://), returns it unchanged
 * Otherwise, prepends the API base URL
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  
  // If already an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise prepend the base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Remove /api suffix if present
  const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBaseUrl}${cleanPath}`;
}
