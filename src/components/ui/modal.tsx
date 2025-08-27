"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  hideTitle?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  hideTitle = false,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-[425px] rounded-sm", className)}>
        {title && (
          <DialogHeader>
            <DialogTitle className={hideTitle ? "hidden" : ""}>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
} 