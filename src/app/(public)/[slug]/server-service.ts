import { ShopResponse } from "@/types/client-catalog";

export type ShopFetchResult =
  | { status: 'success'; data: ShopResponse }
  | { status: 'not_found' }
  | { status: 'unavailable' }
  | { status: 'error' };

export async function fetchShopBySlugServer(slug: string): Promise<ShopFetchResult> {
  try {
    // Use internal Docker network URL for server-side, fallback to public URL
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const isDev = process.env.NODE_ENV === 'development';

    const baseOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    };

    const response = await fetch(`${apiUrl}/customers/shops/${slug}?_t=${Date.now()}`, {
      ...baseOptions,
      ...(isDev
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 60, tags: [`shop-${slug}`] } })
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { status: 'not_found' };
      }
      if (response.status === 403) {
        return { status: 'unavailable' };
      }
      throw new Error(`Failed to fetch shop: ${response.status}`);
    }

    const data = await response.json();
    return { status: 'success', data };
  } catch (error) {
    console.error('Error fetching shop by slug:', error);
    return { status: 'error' };
  }
}

// Function to get all shop slugs for static generation (optional)
export async function getAllShopSlugs(): Promise<string[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/customers/shops`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 86400 } // Revalidate once per day
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shop slugs: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map((shop: any) => shop.attributes.slug);
  } catch (error) {
    console.error('Error fetching shop slugs:', error);
    return [];
  }
}
