import { ShopResponse } from "@/types/client-catalog";

export async function fetchShopBySlugServer(slug: string): Promise<ShopResponse | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiUrl}/customers/shops/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      // Revalidate every 1 hour
      next: { 
        revalidate: 3600,
        tags: [`shop-${slug}`]
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch shop: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shop by slug:', error);
    return null;
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
