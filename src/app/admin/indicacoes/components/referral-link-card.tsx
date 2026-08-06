"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralLinkCardProps {
  referralCode: string;
  referralLink: string;
}

export function ReferralLinkCard({ referralCode, referralLink }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-[#E5E2DD]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Share2 className="h-4 w-4" />
          Seu link de indicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Compartilhe este link com outros lojistas. Quando eles se cadastrarem usando seu link,
          você ganhará <strong>12% de comissão</strong> sobre as mensalidades pagas por eles.
        </p>
        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-sm bg-muted" />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Código: <span className="font-mono font-semibold">{referralCode}</span>
        </p>
      </CardContent>
    </Card>
  );
}
