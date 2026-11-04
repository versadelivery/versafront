"use client";

import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryThumb } from "@/components/category-thumb";

export const CATEGORY_IMAGE_MAX_MB = 5;

// Valida tipo/tamanho; devolve mensagem de erro ou null
export function validateCategoryImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Escolha um arquivo de imagem";
  if (file.size > CATEGORY_IMAGE_MAX_MB * 1024 * 1024) return `A imagem deve ter no máximo ${CATEGORY_IMAGE_MAX_MB} MB`;
  return null;
}

// file: imagem nova escolhida; currentUrl: imagem ja salva (some quando removida/trocada)
export function CategoryImageField({ name, file, currentUrl, onChange, compact }: {
  name: string;
  file: File | null;
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage = !!file || !!currentUrl;
  const pick = (picked?: File) => {
    if (!picked) return;
    const error = validateCategoryImage(picked);
    if (error) toast.error(error); else onChange(picked);
  };

  return (
    <div className="flex items-center gap-3">
      <CategoryThumb name={name} src={currentUrl} file={file} className={compact ? "size-9" : "size-16"} />
      <div className="flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" aria-label="Imagem de categoria" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="mr-1.5 h-4 w-4" />{hasImage ? "Trocar imagem" : "Imagem de categoria"}
        </Button>
        {hasImage && (
          <Button type="button" variant="ghost" size="sm" className="cursor-pointer text-destructive" onClick={() => onChange(null)} aria-label="Remover imagem da categoria">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
