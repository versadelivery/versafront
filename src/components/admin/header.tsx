"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useShop } from "@/hooks/use-shop";
import Image from "next/image";
import logo_inline from "../../../public/logo/logo-inline-black.svg";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAdminActionCable, AdminOrderData } from "@/lib/admin-cable";
import { useRestaurantSounds } from "@/hooks/use-restaurant-sounds";
import { SoundSettings } from "@/components/admin/sound-settings";
import { fixImageUrl } from "@/utils/image-url";

export function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const { shop } = useShop();
  const { subscribeToAdminOrders } = useAdminActionCable();
  const { newOrder, updateSettings } = useRestaurantSounds();
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const handleSignOut = async () => {
    await logout();
  };

  // Assinar pedidos via WS globalmente no header e tocar som quando chegar novo pedido (status received)
  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders((socketOrders: AdminOrderData[]) => {
      try {
        const idsInPayload = new Set<string>(socketOrders.map((o) => o.id));

        // Primeira carga não emite som; apenas inicializa o conjunto conhecido
        if (!initializedRef.current) {
          seenOrderIdsRef.current = idsInPayload;
          initializedRef.current = true;
          return;
        }

        let hasNewReceived = false;
        socketOrders.forEach((o) => {
          if (!seenOrderIdsRef.current.has(o.id) && o.attributes.status === 'received') {
            hasNewReceived = true;
          }
        });

        // Atualiza conjunto visto para refletir estado atual do servidor
        seenOrderIdsRef.current = idsInPayload;

        if (hasNewReceived) {
          newOrder();
        }
      } catch (err) {
        // silenciar erros não críticos do som/WS no header
        console.warn('Header WS sound handler error:', err);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToAdminOrders, newOrder]);

  return (
    <header className="bg-muted">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center justify-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white [&>button]:text-black">
                <SheetHeader>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Image src={logo_inline} alt="Logo" width={120} height={120} />
                  </Link>
                </SheetHeader>
                {/* <nav className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin")}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/pdv")}
                  >
                    PDV
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/catalog")}
                  >
                    Catálogo
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/pedidos")}
                  >
                    Pedidos
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/settings")}
                  >
                    Configurações
                  </Button>
                </nav> */}
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="hidden md:block">
              <Image src={logo_inline} alt="Logo" width={190} height={190} />
            </Link>
            
            {/* Menu Desktop */}
            {/* <nav className="hidden md:flex items-center gap-6 ml-8">
              <Button
                variant="ghost"
                className="font-outfit text-black hover:bg-black/10"
                onClick={() => router.push("/admin")}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="font-outfit text-black hover:bg-black/10"
                onClick={() => router.push("/admin/pdv")}
              >
                PDV
              </Button>
              <Button
                variant="ghost"
                className="font-outfit text-black hover:bg-black/10"
                onClick={() => router.push("/admin/catalogo")}
              >
                Catálogo
              </Button>
              <Button
                variant="ghost"
                className="font-outfit text-black hover:bg-black/10"
                onClick={() => router.push("/admin/pedidos")}
              >
                Pedidos
              </Button>
              <Button
                variant="ghost"
                className="font-outfit text-black hover:bg-black/10"
                onClick={() => router.push("/admin/settings")}
              >
                Configurações
              </Button>
            </nav> */}
          </div>

          <div className="flex items-center gap-12">
            {/* Controle de som global para toda a administração */}
            <div className="hidden md:block">
              <SoundSettings onSettingsChange={updateSettings} />
            </div>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={fixImageUrl(shop?.image_url) || ''} />
                <AvatarFallback className="bg-muted text-black">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-outfit text-sm font-medium text-black">{shop?.name}</p>
                <p className="font-outfit text-xs text-black">{shop?.address}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="default"
              onClick={handleSignOut}
              className="text-white bg-destructive hover:bg-destructive/80 transition-all duration-500 font-outfit px-6 py-2 rounded-xs"
            >
              Sair
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}