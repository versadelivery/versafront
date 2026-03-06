"use client"

import { useClient } from "../client-context";
import { Store, Clock, Truck, Receipt, MapPin, Package } from 'lucide-react';
import Image from 'next/image';
import { CartLink } from '../cart/cart-link';
import Link from "next/link";
import AuthIndicator from './auth-indicator';
import ShopStatus from './shop-status';
import favicon from "@/public/logo/favicon.svg";
import logoInlineBlack from "@/public/logo/logo-inline-black.svg";

interface StoreHeaderProps {
  shop: any;
}

export default function StoreHeader({ shop: initialShop }: StoreHeaderProps) {
  const { client, shop: contextShop } = useClient();
  const shopData = contextShop?.data ?? null;
  const attributes = shopData?.attributes || initialShop?.attributes || {};

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
      {/* Nav header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${attributes.slug}`} className="md:hidden">
              <Image src={favicon} alt="Versa" width={90} height={90} priority />
            </Link>
            <Link href={`/${attributes.slug}`} className="hidden md:block">
              <Image src={logoInlineBlack} alt="Versa" width={180} height={56} priority />
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              <AuthIndicator />
              {client && (
                <>
                  <Link
                    href="/pedidos"
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    Meus Pedidos
                  </Link>
                  <Link
                    href="/pedidos"
                    className="md:hidden flex items-center justify-center h-10 w-10 border border-[#E5E2DD] rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                  </Link>
                </>
              )}
              <CartLink />
            </div>
          </div>
        </div>
      </header>

      {/* Shop info */}
      <div className="w-full bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-5 sm:gap-6">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 border border-[#E5E2DD] rounded-md bg-white overflow-hidden">
              {attributes.image_url ? (
                <img
                  src={attributes.image_url}
                  alt={attributes.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F0EFEB]">
                  <Store className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide leading-tight">
                {attributes.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-2">
                <ShopStatus
                  shopStatusData={attributes.shop_status}
                  shopScheduleConfig={
                    attributes.shop_schedule_config?.data?.attributes ||
                    attributes.shop_schedule_config
                  }
                />
                {attributes.address && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[300px]">{attributes.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-10 mt-5 pt-5 border-t border-[#E5E2DD]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-gray-900 leading-none">30–45 min</p>
                <p className="text-xs text-gray-500 mt-1">Entrega</p>
              </div>
            </div>

            <div className="w-px h-8 bg-[#E5E2DD] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-gray-900 leading-none">{deliveryFee()}</p>
                <p className="text-xs text-gray-500 mt-1">Taxa de entrega</p>
              </div>
            </div>

            <div className="w-px h-8 bg-[#E5E2DD] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-gray-900 leading-none">{minimumOrder()}</p>
                <p className="text-xs text-gray-500 mt-1">Pedido minimo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
