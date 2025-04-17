"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";

interface ImageUploadProps {
  previewImage: string | null;
  onImageChange: (file: File) => void;
  onRemoveImage: () => void;
  hasRemovedImage?: boolean;
}

export function ImageUpload({ 
  previewImage, 
  onImageChange, 
  onRemoveImage,
  hasRemovedImage = false
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {previewImage && !hasRemovedImage && (
        <div className="relative">
          <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-border">
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={previewImage.startsWith('blob:')}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onRemoveImage();
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="absolute -top-2 -right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 w-8 h-8 flex items-center justify-center cursor-pointer border border-border hover:bg-background"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-12 sm:h-14 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            <Camera className="w-5 h-5 text-muted-foreground" />
            <span className="font-outfit text-sm text-muted-foreground mt-1">
              {previewImage && !hasRemovedImage ? 'Alterar imagem' : 'Adicionar imagem'}
            </span>
          </div>
          <input 
            ref={fileInputRef}
            id="image" 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      </div>
    </div>
  );
}