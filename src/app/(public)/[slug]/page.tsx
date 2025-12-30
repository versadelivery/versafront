import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchShopBySlugServer } from './server-service';
import StoreHeader from './components/store-header';
import ClientStoreContent from './client-store-content';
import ShopUnavailable from './shop-unavailable';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchShopBySlugServer(slug);

  if (result.status !== 'success') {
    if (result.status === 'unavailable') {
      return {
        title: 'Loja Temporariamente Indisponível',
      };
    }
    return {
      title: 'Loja não encontrada',
    };
  }

  const shopData = result.data.data.attributes;
  const defaultDescription = `Confira o catálogo completo da ${shopData.name}. Faça seus pedidos online de forma rápida e prática.`;

  return {
    title: `${shopData.name} - Catálogo Online`,
    description: defaultDescription,
    keywords: `${shopData.name}, delivery, catálogo, pedidos online`,
    openGraph: {
      title: `${shopData.name} - Catálogo Online`,
      description: defaultDescription,
      images: shopData.image_url ? [shopData.image_url] : [],
      url: `${process.env.NEXT_PUBLIC_SHOP_DOMAIN}/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${shopData.name} - Catálogo Online`,
      description: defaultDescription,
      images: shopData.image_url ? [shopData.image_url] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function StoreCatalog({ params }: Props) {
  const { slug } = await params;
  const result = await fetchShopBySlugServer(slug);

  if (result.status === 'unavailable') {
    return <ShopUnavailable />;
  }

  if (result.status !== 'success') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader shop={result.data.data} />
      <ClientStoreContent shop={result.data} />
    </div>
  );
}