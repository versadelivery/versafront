import Image, { StaticImageData } from "next/image";
import { ReactNode } from "react";
import { useShop } from "@/app/hooks/use-shop";

export function AdminBanner({ 
  bannerImg,
  children 
}: { 
  bannerImg: StaticImageData;
  children?: ReactNode 
}) {
  const { shop } = useShop();
  const shopImage = shop?.image_url;

  return (
    <div className="relative">
      <div className="h-96 w-full bg-black overflow-hidden lg:rounded-b-[80px] rounded-b-md">
        <Image
          src={bannerImg}
          alt="Background"
          className="w-full h-full object-cover opacity-30"
          priority
        />
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform mt-8 -translate-x-1/2 -translate-y-1/2 z-10">
        {shopImage ? (
          <Image 
            src={shopImage}
            alt="Store Logo" 
            className="h-32 w-32"
            width={800}
            height={800}

          />
        ) : (
          <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-2xl font-bold">
              {shop?.name?.charAt(0)}
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}