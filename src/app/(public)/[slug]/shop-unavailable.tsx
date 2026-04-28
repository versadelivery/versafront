"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Store } from "lucide-react";
import logoHero from "../../../../public/logo/logo-inline-black.svg";
import Image from "next/image";

export default function ShopUnavailable() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary/20">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-500/5"
            style={{
              width: Math.random() * 80 + 20,
              height: Math.random() * 80 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <Card className="relative max-w-4xl w-full mx-4 overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col lg:flex-row items-center p-6 lg:p-12">
          <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 lg:pr-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto lg:mx-0 -mb-12 flex items-center justify-center rounded-lg text-primary">
                <Image src={logoHero} width={256} height={256} alt="Versa Delivery" />
              </div>

              <motion.div
                className="flex items-center justify-center lg:justify-start gap-3 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <Clock className="w-10 h-10 text-amber-500" />
              </motion.div>

              <motion.h2
                className="text-xl md:text-2xl font-medium mb-6 text-foreground/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Loja Temporariamente Indisponível
              </motion.h2>

              <motion.p
                className="text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Esta loja está passando por uma configuração e estará disponível em breve.
                Por favor, volte mais tarde para conferir nossos produtos.
              </motion.p>

              <motion.div
                className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Store className="w-4 h-4" />
                <span>Aguarde a abertura da loja</span>
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 pb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{
                x: mousePosition.x * -30,
                y: mousePosition.y * -30,
              }}
              className="relative"
            >
              <IllustrationUnavailable />
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function IllustrationUnavailable() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 flex items-center justify-center overflow-hidden">
              <div className="absolute w-[200%] h-[200%] bg-secondary/20"
                style={{
                  backgroundImage: `radial-gradient(circle at center, transparent 0%, transparent 20%, rgba(0,0,0,0.1) 20.5%, rgba(0,0,0,0.1) 21%, transparent 21.5%, transparent 30%, rgba(0,0,0,0.1) 30.5%, rgba(0,0,0,0.1) 31%, transparent 31.5%)`,
                  backgroundSize: '4rem 4rem',
                }}
              />
            </div>

            <motion.div
              className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-amber-400/80"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full bg-amber-500/80"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, delay: 0.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-amber-600/80"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, delay: 0.2, repeat: Infinity }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-background/90 shadow-lg flex items-center justify-center"
              >
                <Store className="w-12 h-12 md:w-16 md:h-16 text-amber-500 opacity-90" />
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full" />

                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-amber-500/50 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
