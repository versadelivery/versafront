"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type BusySwitchProps = React.ComponentProps<typeof Switch> & {
  pending?: boolean;
  /** tamanho da caixa do spinner (igual ao do switch, para a tela nao pular) */
  busyClassName?: string;
};

// Troca o switch por um spinner enquanto a requisicao roda
export function BusySwitch({ pending, busyClassName, ...props }: BusySwitchProps) {
  if (!pending) return <Switch {...props} />;
  return (
    <span role="status" aria-label="Salvando" className={cn("inline-flex h-8 w-12 shrink-0 items-center justify-center", busyClassName)}>
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
    </span>
  );
}
