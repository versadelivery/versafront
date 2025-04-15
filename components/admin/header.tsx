"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import logoHeader from "@/public/img/logo.svg";
import { useAuthContext } from "@/app/contexts/auth-context";
import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function Header() {
  const { logout } = useAuthContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-black backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex justify-start">
          <Link href="/">
            <Image src={logoHeader} alt="Versa" width={120} />
          </Link>
        </div>

        <div className="flex justify-end items-center gap-4">
          <div className="hidden md:block">
            <Button
              variant="outline"
              className="cursor-pointer rounded-none font-antarctican-mono bg-transparent border-white text-white hover:bg-white hover:text-black gap-2"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              LOGOUT
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar saída</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja sair do sistema?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
              className="font-antarctican-mono"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={logout}
              className="font-antarctican-mono"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}