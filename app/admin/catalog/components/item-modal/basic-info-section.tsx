import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { useEffect, useState } from "react";
import { getCatalogGroups } from "@/app/services/catalog-service";
import { CatalogGroup } from "@/app/types/admin";
import { ImageUpload } from "../image-upload";

interface BasicInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setDefaultGroupId: (id: string) => void;
  previewImage: string | null;
  onImageChange: (file: File) => void;
  onRemoveImage: () => void;
  hasRemovedImage?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export function BasicInfoSection({ 
  register, 
  errors, 
  setDefaultGroupId,
  previewImage,
  onImageChange,
  onRemoveImage,
  hasRemovedImage = false,
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
          <Label className="text-sm sm:text-md font-bold">IMAGEM</Label>
          <div className="mt-2">
            <ImageUpload
              previewImage={previewImage}
              onImageChange={onImageChange}
              onRemoveImage={onRemoveImage}
              hasRemovedImage={hasRemovedImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}