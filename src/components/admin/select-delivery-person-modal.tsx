'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck } from 'lucide-react';
import { User } from '@/app/admin/settings/users/services/userService';

interface SelectDeliveryPersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryPeople: User[];
  onConfirm: (deliveryPersonName: string) => void;
  defaultValue?: string;
}

export default function SelectDeliveryPersonModal({
  open,
  onOpenChange,
  deliveryPeople,
  onConfirm,
  defaultValue = '',
}: SelectDeliveryPersonModalProps) {
  const [selected, setSelected] = useState(defaultValue);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 rounded-md border-[#E5E2DD] gap-0">
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <DialogTitle className="font-tomato text-base font-semibold text-gray-900">
              Selecionar Entregador
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Escolha o entregador antes de despachar o pedido
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-5 bg-[#FAF9F7]">
          <Select
            value={selected || "none"}
            onValueChange={(value) => setSelected(value === "none" ? "" : value)}
          >
            <SelectTrigger className="w-full h-10 text-sm border-[#E5E2DD] rounded-md bg-white cursor-pointer">
              <SelectValue placeholder="Selecione um entregador" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-[#E5E2DD]">
              <SelectItem value="none">Selecione um entregador</SelectItem>
              {deliveryPeople.map((person) => (
                <SelectItem key={person.id} value={person.attributes.name}>
                  {person.attributes.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[#E5E2DD]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 rounded-md border border-gray-300 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 h-10 rounded-md bg-primary hover:bg-primary/90 text-white border border-gray-300 cursor-pointer text-sm font-semibold"
          >
            <Truck className="w-4 h-4 mr-1.5" />
            Confirmar e Despachar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
