"use client"

import { useClient } from "../client-context";
import { Store, Clock, Truck, Receipt, MapPin, Package } from 'lucide-react';
import Image from 'next/image';
import { CartDrawer } from '../cart/cart-drawer';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AuthIndicator from './auth-indicator';
import ShopStatus from './shop-status';
import favicon from "@/public/logo/favicon.svg";
import logoInlineBlack from "@/public/logo/logo-inline-black.svg";

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
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${attributes.slug}`} className="md:hidden">
              <Image src={favicon} alt="Versa" width={100} height={100} priority />
            </Link>
            <Link href={`/${attributes.slug}`} className="hidden md:block">
              <Image src={logoInlineBlack} alt="Versa" width={190} height={60} priority />
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

      <div className="w-full bg-white border-b border-gray-100">
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-5 pb-4">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="flex-shrink-0 w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              {attributes.image_url ? (
                <img
                  src={attributes.image_url}
                  alt={attributes.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Store className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-wide leading-tight">
                {attributes.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                <ShopStatus
                  shopStatusData={attributes.shop_status}
                  shopScheduleConfig={
                    attributes.shop_schedule_config?.data?.attributes ||
                    attributes.shop_schedule_config
                  }
                />
                {attributes.address && (
                  <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {attributes.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">30–45 min</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Entrega</p>
              </div>
            </div>

            <div className="w-px h-7 bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">{deliveryFee()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Taxa de entrega</p>
              </div>
            </div>

            <div className="w-px h-7 bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">{minimumOrder()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Pedido mínimo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
