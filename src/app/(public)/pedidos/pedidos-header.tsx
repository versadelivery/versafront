"use client"

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClient } from "../[slug]/client-context";
import favicon from "@/public/logo/favicon.svg";
import logoInlineBlack from "@/public/logo/logo-inline-black.svg";

interface PedidosHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export default function PedidosHeader({
  backHref = "/pedidos",
  backLabel = "Meus Pedidos",
}: PedidosHeaderProps) {
  const { client, logout } = useClient();

  const shopSlug =
    typeof window !== "undefined"
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem("shop") || "{}")?.data
              ?.attributes?.slug;
          } catch {
            return null;
          }
        })()
      : null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const logoHref = shopSlug ? `/${shopSlug}` : "/";

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E2DD]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={logoHref} className="md:hidden cursor-pointer">
              <Image src={favicon} alt="Versa" width={100} height={100} priority />
            </Link>
            <Link href={logoHref} className="hidden md:block cursor-pointer">
              <Image
                src={logoInlineBlack}
                alt="Versa"
                width={190}
                height={60}
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {client && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-2 h-auto"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={client.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {client.name.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {client.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Link href={backHref}>
                <ChevronLeft className="w-4 h-4 mr-0.5" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
