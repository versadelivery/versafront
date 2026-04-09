"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import logoInlineBlack from "../../../public/logo/logo-inline-black.svg";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <p className="font-tomato text-8xl font-bold text-gray-900 leading-none">404</p>
        <h1 className="font-tomato text-2xl font-semibold text-gray-900 mt-4">
          Página não encontrada
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Button asChild className="mt-8 rounded-md gap-2" variant="outline">
          <Link href="/">
            <ChevronLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </Button>
      </div>
    </div>
  );
}
