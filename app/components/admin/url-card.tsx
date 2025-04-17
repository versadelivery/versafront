import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useShop } from "@/app/hooks/use-shop";

export function UrlCard({ url }: { url: string }) {
  const { shop } = useShop();
  const shopSlug = shop?.slug;

  return (
    <Card className="bg-white py-4 lg:px-12 px-4 mb-8 border-none rounded-lg shadow-lg flex items-center justify-center">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center justify-center gap-4">
          <p className="text-sm lg:text-lg">{`${url}/${shopSlug}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
            <Copy className="h-6 w-6 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
            <ExternalLink className="h-6 w-6 text-gray-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}