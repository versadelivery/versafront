"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  type: string;
}

export function DeleteConfirmation({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  isLoading,
  type = "Grupo"
}: DeleteConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="font-outfit">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-outfit text-xl">Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription className="font-outfit text-base text-muted-foreground">
            Tem certeza que deseja excluir este {type}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="font-outfit border-none bg-muted hover:bg-muted/80" 
            disabled={isLoading}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            className="font-outfit bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}