"use client"

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useClient } from "../client-context";
import { Store, Clock, Truck, Receipt, MapPin, Package, Megaphone } from 'lucide-react';
import Image from 'next/image';
import { CartLink } from '../cart/cart-link';
import Link from "next/link";
import AuthIndicator from './auth-indicator';
import ShopStatus from './shop-status';
import favicon from "@/public/logo/favicon.svg";
import logoInlineBlack from "@/public/logo/logo-inline-black.svg";

import { getTextColors } from '../theme-utils';

interface StoreHeaderProps {
  shop: any;
}

export default function StoreHeader({ shop: initialShop }: StoreHeaderProps) {
  const { shop: contextShop } = useClient();
  const params = useParams();
  const storeSlug = params?.slug as string;
  const [hasCustomerInfo, setHasCustomerInfo] = useState(false);

  useEffect(() => {
    setHasCustomerInfo(!!localStorage.getItem('customer_info'));
  }, []);
  const shopData = contextShop?.data ?? null;
  const attributes = shopData?.attributes || initialShop?.attributes || {};

  const headerColor = attributes.header_color || null;
  const { isDark, text: textColor, textMuted: mutedColor, border: borderColor, subtleBg } = useMemo(
    () => getTextColors(headerColor), [headerColor]
  );

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

  const headerStyle = headerColor ? { backgroundColor: headerColor } : {};
  const headerBorderStyle = { borderColor };

  return (
    <>
      {/* Banner promocional */}
      {attributes.banner_active && attributes.banner_text && (
        <div
          className="w-full px-4 py-2 text-center text-sm font-medium z-40 sticky top-0"
          style={{
            backgroundColor: headerColor || '#1F2937',
            color: headerColor ? textColor : '#FFFFFF',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2">
            <Megaphone className="w-4 h-4 flex-shrink-0" />
            <span>{attributes.banner_text}</span>
          </div>
        </div>
      )}

      {/* Nav header */}
      <header
        className="sticky z-40 w-full"
        style={{
          ...headerStyle,
          ...(!headerColor ? { backgroundColor: '#FFFFFF' } : {}),
          borderBottom: `1px solid ${borderColor}`,
          top: attributes.banner_active && attributes.banner_text ? '37px' : '0px',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${attributes.slug}`} className="md:hidden cursor-pointer">
              <Image
                src={favicon}
                alt="Versa"
                width={90}
                height={90}
                priority
                style={isDark ? { filter: 'brightness(0) invert(1)' } : undefined}
              />
            </Link>
            <Link href={`/${attributes.slug}`} className="hidden md:block cursor-pointer">
              <Image
                src={logoInlineBlack}
                alt="Versa"
                width={180}
                height={56}
                priority
                style={isDark ? { filter: 'brightness(0) invert(1)' } : undefined}
              />
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              <AuthIndicator isDarkHeader={isDark} />
              {hasCustomerInfo && (
                <>
                  <Link
                    href={`/${storeSlug}/meus-pedidos`}
                    className="hidden md:flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                    style={{ color: mutedColor }}
                  >
                    <Package className="w-5 h-5" />
                    Meus Pedidos
                  </Link>
                  <Link
                    href={`/${storeSlug}/meus-pedidos`}
                    className="md:hidden flex items-center justify-center h-10 w-10 rounded-md transition-colors cursor-pointer"
                    style={{ borderColor, color: mutedColor, borderWidth: '1px' }}
                  >
                    <Package className="w-5 h-5" />
                  </Link>
                </>
              )}
              <CartLink isDarkHeader={isDark} />
            </div>
          </div>
        </div>
      </header>

      {/* Shop info */}
      <div
        className="w-full"
        style={{
          ...headerStyle,
          ...(!headerColor ? { backgroundColor: '#FFFFFF' } : {}),
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-5 sm:gap-6">
            <div
              className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden"
              style={{ borderColor, borderWidth: '1px', backgroundColor: headerColor || '#FFFFFF' }}
            >
              {attributes.image_url ? (
                <img
                  src={attributes.image_url}
                  alt={attributes.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: subtleBg }}>
                  <Store className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: mutedColor }} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight"
                style={{ color: textColor }}
              >
                {attributes.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-2">
                <ShopStatus
                  shopStatusData={attributes.shop_status}
                  shopScheduleConfig={
                    attributes.shop_schedule_config?.data?.attributes ||
                    attributes.shop_schedule_config
                  }
                  isDarkHeader={isDark}
                />
                {attributes.address && (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: mutedColor }}>
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[300px]">{attributes.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-5 sm:gap-10 mt-5 pt-5"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 flex-shrink-0" style={{ color: mutedColor }} />
              <div>
                <p className="text-base font-semibold leading-none" style={{ color: textColor }}>30–45 min</p>
                <p className="text-xs mt-1" style={{ color: mutedColor }}>Entrega</p>
              </div>
            </div>

            <div className="w-px h-8 hidden sm:block" style={{ backgroundColor: borderColor }} />

            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 flex-shrink-0" style={{ color: mutedColor }} />
              <div>
                <p className="text-base font-semibold leading-none" style={{ color: textColor }}>{deliveryFee()}</p>
                <p className="text-xs mt-1" style={{ color: mutedColor }}>Taxa de entrega</p>
              </div>
            </div>

            <div className="w-px h-8 hidden sm:block" style={{ backgroundColor: borderColor }} />

            <div className="flex items-center gap-2.5">
              <Receipt className="w-5 h-5 flex-shrink-0" style={{ color: mutedColor }} />
              <div>
                <p className="text-base font-semibold leading-none" style={{ color: textColor }}>{minimumOrder()}</p>
                <p className="text-xs mt-1" style={{ color: mutedColor }}>Pedido minimo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
