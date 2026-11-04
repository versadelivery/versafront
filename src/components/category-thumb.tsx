"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { categoryIcon } from "@/utils/category-icon";
import { fixImageUrl } from "@/utils/image-url";
import { cn } from "@/lib/utils";

// Imagem da categoria (URL salva ou arquivo recem-escolhido) ou, sem imagem, um icone de linha apagado relacionado ao nome
export function CategoryThumb({ name, src, file, className, iconClassName }: { name: string; src?: string | null; file?: File | null; className?: string; iconClassName?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview ?? (file ? null : fixImageUrl(src) || null);
  const Icon = categoryIcon(name);
  return (
    <span className={cn("relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#F0EFEB]", className)}>
      {shown ? (
        <Image src={shown} alt={name} fill sizes="64px" className="object-cover" loading="lazy" unoptimized />
      ) : (
        <Icon aria-hidden="true" strokeWidth={1.5} className={cn("size-1/2 text-muted-foreground/40", iconClassName)} />
      )}
    </span>
  );
}
