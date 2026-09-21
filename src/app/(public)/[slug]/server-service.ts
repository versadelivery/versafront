import { ShopResponse } from "@/types/client-catalog";

export type ShopFetchResult =
  | { status: 'success'; data: ShopResponse }
  | { status: 'not_found' }
  | { status: 'unavailable' }
  | { status: 'error' };

export async function fetchShopBySlugServer(slug: string): Promise<ShopFetchResult> {
  const isDev = process.env.NODE_ENV === 'development';
  const apiUrls = Array.from(new Set([
    process.env.INTERNAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    'http://localhost:3001',
  ].filter(Boolean))) as string[];

  let lastError: unknown;

  for (const apiUrl of apiUrls) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(`${apiUrl}/customers/shops/${slug}`, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          signal: AbortSignal.timeout(10_000),
          ...(isDev
            ? { cache: 'no-store' as const }
            : { next: { revalidate: 60, tags: [`shop-${slug}`] } })
        });

        if (response.ok) {
          const data = await response.json();
          return { status: 'success', data };
        }

        if (response.status === 403) {
          return { status: 'unavailable' };
        }

        // A private Railway URL can become stale while the public URL is still
        // healthy. Try the next configured URL before treating the shop as absent.
        if (response.status === 404 && apiUrl === apiUrls[apiUrls.length - 1]) {
          return { status: 'not_found' };
        }

        lastError = new Error(`Failed to fetch shop from ${apiUrl}: ${response.status}`);
      } catch (error) {
        lastError = error;
      }

      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }

  console.error('Error fetching shop by slug:', lastError);
  return { status: 'error' };
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
