import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

interface UrlCardProps {
  title?: string;
  url: string;
  isLoading?: boolean;
}

export function UrlCard({ title, url, isLoading }: UrlCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success("URL copiada com sucesso!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-background rounded-lg p-6 border border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="h-4 w-full flex items-center justify-center mb-2" />
          ) : (
            <>
              <h3 className="font-outfit text-lg font-semibold mb-2">{title}</h3>
              <p className="font-outfit text-sm text-muted-foreground break-all">{url}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-primary"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(url, "_blank")}
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}