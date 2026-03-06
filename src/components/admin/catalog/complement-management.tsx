"use client";

import { useCatalogComplement } from "@/hooks/useCatalogComplement";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, ListChecks, Loader2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { ComplementGroupModal } from "./complement-group-modal";

export function ComplementManagement() {
  const { complementGroups, isLoading, deleteComplementGroup, isDeleting } = useCatalogComplement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [groupIdToDelete, setGroupIdToDelete] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingGroupId(id);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingGroupId(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setGroupIdToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (groupIdToDelete) {
      await deleteComplementGroup(groupIdToDelete);
      setIsDeleteOpen(false);
      setGroupIdToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando adicionais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Adicionais Compartilhados</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie listas de adicionais que podem ser vinculadas a múltiplos itens.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 border border-gray-300 cursor-pointer">
          <Plus className="h-4 w-4" />
          Nova Lista
        </Button>
      </div>

      {complementGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-md border border-dashed border-[#E5E2DD]">
          <ListChecks className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-base font-semibold">Nenhuma lista encontrada</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Crie sua primeira lista de adicionais (ex: Adicionais de Hambúrguer) para começar.
          </p>
          <Button onClick={handleCreate} variant="outline" className="gap-2 border border-gray-300 cursor-pointer">
            <Plus className="h-4 w-4" />
            Criar Primeira Lista
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complementGroups.map((group: any) => (
            <div key={group.id} className="bg-white p-4 rounded-md border border-[#E5E2DD] hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-base truncate pr-2">{group.attributes.name}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(group.id)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(group.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                {group.attributes.options.slice(0, 3).map((option: any) => (
                  <div key={option.id} className="text-xs text-muted-foreground flex justify-between">
                    <span>• {option.name}</span>
                    {option.price > 0 && <span>+ R$ {option.price.toFixed(2).replace('.', ',')}</span>}
                  </div>
                ))}
                {group.attributes.options.length > 3 && (
                  <p className="text-[10px] text-primary font-medium mt-1">
                    + {group.attributes.options.length - 3} outras opções
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ComplementGroupModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        groupId={editingGroupId}
      />

      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="lista de adicionais"
      />
    </div>
  );
}
