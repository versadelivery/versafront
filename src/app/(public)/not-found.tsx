"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Compass, Map } from "lucide-react";
import logoHero from "../../../public/logo/logo-inline-black.svg";
import Image from "next/image";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: Math.random() * 80 + 20,
      height: Math.random() * 80 + 20,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animateY: Math.random() * 100 - 50,
      duration: Math.random() * 10 + 10,
    })),
  []);

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

  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary/20">
      <div className="absolute inset-0 overflow-hidden">
        {mounted && particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
            }}
            animate={{
              y: [0, p.animateY],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: p.duration,
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

              <h1 className="font-tomato text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                <motion.span 
                  className="inline-block text-primary"
                  animate={{ 
                    x: mousePosition.x * 20,
                    y: mousePosition.y * 20,
                  }}
                >
                  4
                </motion.span>
                <motion.span 
                  className="inline-block text-primary"
                  animate={{ 
                    x: mousePosition.x * -30,
                    y: mousePosition.y * -30,
                  }}
                >
                  0
                </motion.span>
                <motion.span 
                  className="inline-block text-primary"
                  animate={{ 
                    x: mousePosition.x * 25,
                    y: mousePosition.y * 25,
                  }}
                >
                  4
                </motion.span>
              </h1>

              <motion.h2 
                className="text-xl md:text-2xl font-medium mb-6 text-foreground/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Loja não encontrada
              </motion.h2>

              <motion.p 
                className="text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                A loja que você está procurando parece ter desaparecido no espaço digital. Talvez ela esteja em uma aventura ou tomando um descanso bem-desejado.
              </motion.p>
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
              <IllustrationNotFound />
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function IllustrationNotFound() {
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
            <div className="absolute inset-0 rounded-full bg-secondary/40 flex items-center justify-center overflow-hidden">
              <div className="absolute w-[200%] h-[200%] bg-secondary/20" 
                style={{
                  backgroundImage: `radial-gradient(circle at center, transparent 0%, transparent 20%, rgba(0,0,0,0.1) 20.5%, rgba(0,0,0,0.1) 21%, transparent 21.5%, transparent 30%, rgba(0,0,0,0.1) 30.5%, rgba(0,0,0,0.1) 31%, transparent 31.5%)`,
                  backgroundSize: '4rem 4rem',
                }}
              />
              <div className="absolute w-full h-full" 
                style={{
                  backgroundImage: `linear-gradient(to right, transparent 49.5%, rgba(0,0,0,0.1) 49.5%, rgba(0,0,0,0.1) 50.5%, transparent 50.5%), 
                                   linear-gradient(to bottom, transparent 49.5%, rgba(0,0,0,0.1) 49.5%, rgba(0,0,0,0.1) 50.5%, transparent 50.5%)`,
                  backgroundSize: '4rem 4rem',
                }}
              />
            </div>

            <motion.div 
              className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-chart-1/80"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full bg-chart-2/80"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, delay: 0.5, repeat: Infinity }}
            />
            <motion.div 
              className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-chart-3/80"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, delay: 0.2, repeat: Infinity }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-background/90 shadow-lg flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <Map className="w-12 h-12 md:w-16 md:h-16 text-primary opacity-90" />
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                
                {['N', 'E', 'S', 'W'].map((dir, i) => (
                  <div 
                    key={dir}
                    className="absolute text-xs font-bold text-primary/70"
                    style={{
                      transform: `rotate(${i * 90}deg) translateY(-40px)`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {dir}
                  </div>
                ))}

                <motion.div 
                  className="absolute h-full w-1 flex justify-center"
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: [0, 30, -45, 180, 220, 360],
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-1 h-1/2 bg-gradient-to-b from-chart-1 to-transparent relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-chart-1" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}