import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Camera } from "lucide-react";

export function BasicInfoSection() {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm sm:text-md font-bold">NOME</Label>
        <Input 
          placeholder="Ex: Carne moída" 
          className="mt-2 py-6 text-base"
        />
      </div>

      <div>
        <Label className="text-sm sm:text-md font-bold">DESCRIÇÃO</Label>
        <Input 
          placeholder="Ex: Carne de primeira qualidade só o filé" 
          className="mt-2 py-6 text-base"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm sm:text-md font-bold">GRUPO</Label>
          <Select>
            <SelectTrigger className="mt-2 py-6 text-base">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="carnes">Carnes</SelectItem>
              <SelectItem value="bebidas">Bebidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="image" className="text-md sm:text-md font-bold text-foreground block mb-1 sm:mb-2">
            IMAGEM DO PRODUTO
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-12 sm:h-14 border-2 border-gray-300 border-dashed rounded-xs cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-2 pb-3">
                <Camera className="w-5 h-5 text-foreground" />
                <span className="text-xs sm:text-sm text-foreground/60 mt-1">Clique para adicionar imagem</span>
              </div>
              <Input id="image" type="file" className="hidden placeholder:text-foreground/40" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}