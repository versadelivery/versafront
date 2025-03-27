import Image, { StaticImageData } from "next/image";
import { ReactNode } from "react";

export function AdminBanner({ 
  bannerImg, 
  logo, 
  children 
}: { 
  bannerImg: StaticImageData;
  logo: StaticImageData;
  children?: ReactNode 
}) {
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
        <Image 
          src={logo} 
          alt="Store Logo" 
          className="h-24 w-24"
        />
      </div>
      {children}
    </div>
  );
}