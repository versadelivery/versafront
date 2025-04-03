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
          <div className="w-32 h-32 relative rounded-xs overflow-hidden">
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
            className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 text-white" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-12 sm:h-14 border-2 border-gray-300 border-dashed rounded-xs cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            <Camera className="w-5 h-5 text-foreground" />
            <span className="text-xs sm:text-sm text-foreground/60 mt-1">
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