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

  useEffect(() => {
    const unsubscribe = subscribeToAdminOrders((socketOrders: AdminOrderData[]) => {
      try {
        const idsInPayload = new Set<string>(socketOrders.map((o) => o.id));

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

        seenOrderIdsRef.current = idsInPayload;

        if (hasNewReceived) {
          newOrder();
        }
      } catch (err) {
        console.warn('Header WS sound handler error:', err);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToAdminOrders, newOrder]);

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-center gap-4">
            <Link href="/admin" className="md:hidden">
              <Image src={favicon} alt="Logo" width={100} height={100} />
            </Link>
            <Link href="/admin" className="hidden md:block">
              <Image src={logo_inline} alt="Logo" width={190} height={60} />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <SoundSettings onSettingsChange={updateSettings} />
            </div>
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9">
                <AvatarImage src={fixImageUrl(shop?.image_url) || ''} />
                <AvatarFallback className="bg-gray-100 text-muted-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-outfit text-sm font-medium text-foreground">{shop?.name}</p>
                <p className="font-outfit text-xs text-muted-foreground">{shop?.address}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSignOut}
              className="h-9 w-9 rounded-lg border-gray-200 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}