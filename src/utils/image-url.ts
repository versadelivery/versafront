export function fixImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  
  if (url.includes('ngrok-free.app')) {
    return url;
  }
  
  if (url.includes('localhost:3001')) {
    return url.replace('http://localhost:3001', process.env.NEXT_PUBLIC_API_URL || '');
  }
  
  if (url.includes('localhost') && !url.includes(':')) {
    return url.replace('http://localhost', process.env.NEXT_PUBLIC_API_URL || '');
  }
  
  return url;
}
