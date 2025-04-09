"use client";

import { Modal } from "@/components/ui/modal";
import { AuthForm } from "@/app/(client)/client-auth/(auth)/auth-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Autenticação"
      className="max-w-md"
    >
      <div className="py-4">
        <AuthForm />
      </div>
    </Modal>
  );
} 