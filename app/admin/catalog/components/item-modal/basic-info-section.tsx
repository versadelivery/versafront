import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Camera, X } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { useEffect, useState } from "react";
import { getCatalogGroups } from "@/app/services/catalog-service";
import { CatalogGroup } from "@/app/types/admin";
import Image from "next/image";

interface BasicInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setDefaultGroupId: (id: string) => void;
  setImageFile: (file: File) => void;
  previewImage: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export function BasicInfoSection({ 
  register, 
  errors, 
  setDefaultGroupId,
  setImageFile,
  previewImage,
  onImageChange,
  onRemoveImage,
  fileInputRef
}: BasicInfoSectionProps) {
  const [groups, setGroups] = useState<CatalogGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getCatalogGroups();
        setGroups(data);
        
        if (data.length > 0) {
          setSelectedGroup(data[0].id.toString());
          setDefaultGroupId(data[0].id.toString());
        }
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    setDefaultGroupId(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm sm:text-md font-bold">NOME</Label>
        <Input 
          placeholder="Ex: Carne moída" 
          className="mt-2 py-6 text-base"
          {...register('name', { required: 'Nome é obrigatório' })}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
      </div>

      <div>
        <Label className="text-sm sm:text-md font-bold">DESCRIÇÃO</Label>
        <Input 
          placeholder="Ex: Carne de primeira qualidade só o filé" 
          className="mt-2 py-6 text-base"
          {...register('description', { required: 'Descrição é obrigatória' })}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm sm:text-md font-bold">GRUPO</Label>
          <Select value={selectedGroup} onValueChange={handleGroupChange}>
            <SelectTrigger className="mt-2 py-6 text-base">
              <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um grupo"} />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <span className="text-sm">Carregando grupos...</span>
                </div>
              ) : (
                groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="image" className="text-md sm:text-md font-bold text-foreground block mb-1 sm:mb-2">
            IMAGEM DO PRODUTO
          </label>
          <div className="flex flex-col items-center gap-4">
            {previewImage && (
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
                  onClick={onRemoveImage}
                  className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1"
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
                    {previewImage ? 'Alterar imagem' : 'Adicionar imagem'}
                  </span>
                </div>
                <input 
                  ref={fileInputRef}
                  id="image" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={onImageChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}