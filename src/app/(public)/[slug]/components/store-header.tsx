"use client"

import { useClient } from "../client-context";
import { Store, Clock, Truck, Receipt, MapPin, Package } from 'lucide-react';
import Image from 'next/image';
import { CartDrawer } from '../cart/cart-drawer';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AuthIndicator from './auth-indicator';
import ShopStatus from './shop-status';

interface StoreHeaderProps {
  shop: any;
}

export default function StoreHeader({ shop }: StoreHeaderProps) {
  const { client } = useClient();
  const attributes = shop?.attributes || {};

  const deliveryFee = () => {
    const config = attributes.shop_delivery_config?.data?.attributes;
    if (!config) return 'A combinar';
    if (config.delivery_fee_kind === 'fixed') {
      return `R$ ${Number(config.amount).toFixed(2).replace('.', ',')}`;
    }
    if (config.delivery_fee_kind === 'per_neighborhood') return 'Por bairro';
    return 'A combinar';
  };

  const minimumOrder = () => {
    const min = attributes.shop_delivery_config?.data?.attributes?.minimum_order_value || 0;
    return `R$ ${Number(min).toFixed(2).replace('.', ',')}`;
  };

  return (
    <>
      {/* Top nav — clean, like admin header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${attributes.slug}`} className="flex items-center">
              <Image
                src="/logo/logo-inline-black.svg"
                alt="Versa"
                width={110}
                height={30}
                priority
                className="h-auto w-[90px] md:w-[110px]"
              />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <AuthIndicator />
              {client && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden md:flex text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/pedidos">
                      <Package className="w-4 h-4 mr-1.5" />
                      Meus Pedidos
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="md:hidden h-9 w-9 text-muted-foreground">
                    <Link href="/pedidos">
                      <Package className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              )}
              <CartDrawer />
            </div>
          </div>
        </div>
      </header>

      {/* Shop banner */}
      <div className="w-full bg-white border-b border-gray-100">
        {/* Cover image */}
        {attributes.image_url && (
          <div className="relative w-full h-[140px] sm:h-[200px] overflow-hidden bg-gray-100">
            <img
              src={attributes.image_url}
              alt={attributes.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {/* Shop identity */}
        <div className="container mx-auto px-4 max-w-7xl py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              {attributes.image_url ? (
                <img
                  src={attributes.image_url}
                  alt={attributes.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Store className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate leading-tight">
                {attributes.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <ShopStatus
                  shopStatusData={attributes.shop_status}
                  shopScheduleConfig={
                    attributes.shop_schedule_config?.data?.attributes ||
                    attributes.shop_schedule_config
                  }
                />
                {attributes.address && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {attributes.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-none">30–45 min</p>
                <p className="text-[10px] text-muted-foreground">Entrega</p>
              </div>
            </div>

            <div className="w-px h-5 bg-gray-200" />

            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-none">{deliveryFee()}</p>
                <p className="text-[10px] text-muted-foreground">Taxa de entrega</p>
              </div>
            </div>

            <div className="w-px h-5 bg-gray-200" />

            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-none">{minimumOrder()}</p>
                <p className="text-[10px] text-muted-foreground">Pedido mínimo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
