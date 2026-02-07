"use client"

import { useClient } from "../client-context";
import { Package, Store, Clock, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { CartDrawer } from '../cart/cart-drawer';
import { motion } from 'framer-motion';
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
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/80 border-b border-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href={`/${attributes.slug}`}>
              <Image 
                src="/logo/logo-inline.svg" 
                alt="Versa Logo" 
                width={100} 
                height={28} 
                priority
                className="h-auto w-[100px]"
              />
            </Link>
          </motion.div>
          
          <div className="flex items-center justify-end gap-3 flex-1">
            <AuthIndicator />
            {client && (
              <>
                <Button variant="ghost" asChild className="hidden md:flex font-medium text-white hover:text-primary transition-colors">
                  <Link href="/pedidos">
                    <Package className="w-4 h-4 mr-2" />
                    Meus Pedidos
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="md:hidden text-white hover:text-primary">
                  <Link href="/pedidos">
                    <Package className="w-5 h-5" />
                  </Link>
                </Button>
              </>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <CartDrawer />
            </motion.div>
          </div>
        </div>
      </header>

      <div className="relative w-full">
        {/* Banner Area - Centralized Hero */}
        <div className="relative min-h-[320px] sm:min-h-[400px] md:min-h-[500px] flex items-center justify-center py-12 sm:py-20">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: attributes.image_url 
                ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${attributes.image_url})` 
                : 'linear-gradient(135deg, var(--primary), #000)',
            }}
          />
          
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white dark:bg-card p-1.5 shadow-2xl overflow-hidden border-4 border-white/20">
                {attributes.image_url ? (
                  <img 
                    src={attributes.image_url} 
                    alt={attributes.name} 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-2xl">
                    <Store className="w-12 h-12 text-primary" />
                  </div>
                )}
              </div>
            </motion.div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
            >
              {attributes.name}
            </motion.h1>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 text-white/90"
            >
              <ShopStatus 
                shopStatusData={attributes.shop_status}
                shopScheduleConfig={attributes.shop_schedule_config?.data?.attributes || attributes.shop_schedule_config}
              />
              {attributes.address && (
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{attributes.address}</span>
                </div>
              )}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 grid grid-cols-3 gap-6 sm:gap-12 text-white"
            >
              <div className="flex flex-col items-center">
                <Clock className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] uppercase font-bold text-white/60">Tempo</span>
                <span className="text-sm font-bold">30-45 min</span>
              </div>
              <div className="flex flex-col items-center">
                <Package className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] uppercase font-bold text-white/60">Entrega</span>
                <span className="text-sm font-bold">
                  {attributes.shop_delivery_config?.data?.attributes?.delivery_fee_kind === 'fixed' 
                    ? `R$ ${attributes.shop_delivery_config.data.attributes.amount.toFixed(2).replace('.', ',')}`
                    : attributes.shop_delivery_config?.data?.attributes?.delivery_fee_kind === 'per_neighborhood'
                      ? 'Bairros'
                      : 'A combinar'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] uppercase font-bold text-white/60">Mínimo</span>
                <span className="text-sm font-bold">
                  R$ {(attributes.shop_delivery_config?.data?.attributes?.minimum_order_value || 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

    </>
  );
}