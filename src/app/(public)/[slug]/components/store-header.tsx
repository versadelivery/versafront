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
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full p-4 backdrop-blur-md bg-black/95 shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Image 
              src="/logo/logo-inline.svg" 
              alt="Logo" 
              width={150} 
              height={40} 
              priority
              className="h-auto"
            />
          </motion.div>
          
          <div className="flex items-center justify-center gap-4">
            <AuthIndicator />
            
            {client && (
              <Button variant="outline" className="hidden md:flex bg-primary text-white hover:text-black/80 border-none py-5 px-8 rounded-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group">
                <Package className="w-4 h-4 mr-2" />
                <Link href="/pedidos">
                  <span className="text-sm font-medium">Meus Pedidos</span>
                </Link>
              </Button>
            )}

          
            <Button variant="outline" className="mr-4 md:hidden bg-transparent items-center justify-center text-white border border-white py-5 px-12 rounded-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group">
              <Package className="w-6 h-6" />
            </Button>
          
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <CartDrawer />
            </motion.div>
        
          </div>
        </div>
      </header>

      <motion.div 
        className="bg-gradient-to-r from-primary to-primary/80 py-10 sm:py-16 text-white px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-start gap-6 max-w-7xl">
          <motion.div 
            className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
          >
            <Store className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </motion.div>
          
          <div className="text-center sm:text-left flex-1">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {shop.attributes.name}
            </motion.h1>
            
            {/* Status da Loja */}
            <motion.div 
              className="flex items-center justify-center sm:justify-start mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <ShopStatus 
                shopStatusData={shop.attributes.shop_status}
                shopScheduleConfig={shop.attributes.shop_schedule_config?.data?.attributes || shop.attributes.shop_schedule_config}
              />
            </motion.div>

            {/* Informações de Contato */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-white/90"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {shop.attributes.cellphone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{shop.attributes.cellphone}</span>
                </div>
              )}

              {shop.attributes.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{shop.attributes.address}</span>
                </div>
              )}
            </motion.div>

            {/* Descrição da Loja */}
            {shop.attributes.description && (
              <motion.div 
                className="mt-3 text-white/80"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <p className="text-sm max-w-2xl">{shop.attributes.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}