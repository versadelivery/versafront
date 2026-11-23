import { ReactNode } from "react";
import { useShop } from "@/hooks/use-shop";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { Loader2 } from "lucide-react";
import { fixImageUrl } from "@/utils/image-url";

interface AdminBannerProps {
  bannerImg: StaticImageData;
  children?: ReactNode;
}

export function AdminBanner({ bannerImg, children }: AdminBannerProps) {
  const { shop, isLoading } = useShop();
  const shopImage = fixImageUrl(shop?.image_url);
  // Banner próprio da loja; sem ele fica a imagem padrão (a mesma do app)
  const customBanner = fixImageUrl(shop?.admin_banner_url);

  return (
    <div className="relative">
      <div className="h-96 w-full bg-black overflow-hidden lg:rounded-b-[80px] rounded-b-md">
        {customBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customBanner}
            alt="Banner da loja"
            data-testid="admin-banner-custom"
            className="w-full h-full object-cover opacity-30"
          />
        ) : (
          <Image
            src={bannerImg}
            alt="Background"
            data-testid="admin-banner-default"
            className="w-full h-full object-cover opacity-30"
            priority
          />
        )}
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform mt-8 -translate-x-1/2 -translate-y-1/2 z-10">
        {shopImage ? (
          isLoading ? (
            <Loader2 className="h-32 w-32 rounded-full object-cover" />
          ) : (
            <Image 
              src={shopImage}
              alt="Store Logo" 
              className="h-32 w-32 rounded-full object-cover"
              width={800}
              height={800}
            />
          )
        ) : (
          <div className="h-32 w-32 bg-muted rounded-full flex items-center justify-center">
            <span className="text-muted-foreground text-2xl font-bold">
              {shop?.name?.charAt(0)}
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}