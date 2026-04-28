import Image from "next/image";
import favicon from "@/public/logo/favicon.svg";

export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <Image
        src={favicon}
        alt="Versa"
        width={140}
        height={140}
        priority
        className="animate-pulse"
      />
    </div>
  );
}
