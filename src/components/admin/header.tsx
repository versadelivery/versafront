"use client";

import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useShop } from "@/hooks/use-shop";
import Image from "next/image";
import logo_inline from "@/public/logo/logo-inline-black.svg";
import favicon from "@/public/logo/favicon.svg";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAdminActionCable, AdminOrderData } from "@/lib/admin-cable";
import { useRestaurantSounds } from "@/hooks/use-restaurant-sounds";
import { SoundSettings } from "@/components/admin/sound-settings";
import { CommandMenu } from "@/components/admin/command-menu";
import { fixImageUrl } from "@/utils/image-url";

export function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const { shop } = useShop();
  const { subscribeToAdminOrders } = useAdminActionCable();
  const { newOrder, updateSettings } = useRestaurantSounds();
  const seenOrderIdsRef = useRef<Set<string>>(new Set());

  const handleSignOut = async () => {
    await logout();
  };

  useEffect(() => {
    // Sem lista inicial: o cabeçalho só precisa saber quando chega um pedido novo. "Novo" = recebido, ainda não
    // visto e criado há poucos minutos (um pedido antigo que só foi atualizado não toca o som).
    const FRESH_ORDER_MS = 3 * 60 * 1000;
    const unsubscribe = subscribeToAdminOrders((socketOrders: AdminOrderData[]) => {
      try {
        let hasNewReceived = false;
        socketOrders.forEach((o) => {
          const isFresh = Date.now() - new Date(o.attributes.created_at).getTime() < FRESH_ORDER_MS;
          if (!seenOrderIdsRef.current.has(o.id) && o.attributes.status === 'received' && isFresh) {
            hasNewReceived = true;
          }
          seenOrderIdsRef.current.add(o.id);
        });

        if (hasNewReceived) {
          newOrder();
        }
      } catch (err) {
        console.warn('Header WS sound handler error:', err);
      }
    }, undefined, { initialData: false });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToAdminOrders, newOrder]);

  return (
    <header className="bg-white border-b border-[#E5E2DD]">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="md:hidden">
              <Image src={favicon} alt="Logo" width={110} height={110} />
            </Link>
            <Link href="/admin" className="hidden md:block">
              <Image src={logo_inline} alt="Logo" width={210} height={66} />
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <CommandMenu />
            <div className="hidden md:block">
              <SoundSettings onSettingsChange={updateSettings} />
            </div>
            <div className="h-7 w-px bg-[#E5E2DD] hidden md:block" />
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={fixImageUrl(shop?.image_url) || ''} />
                <AvatarFallback className="bg-[#F0EFEB] text-muted-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{shop?.name}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[220px]">{shop?.address}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSignOut}
              className="h-10 w-10 rounded-md border-[#E5E2DD] text-muted-foreground hover:text-destructive hover:border-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}