"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.6 });

  return (
    <section 
      id="contato" 
      ref={ref}
      className="bg-black text-white py-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-xs blur-3xl"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-zinc-900/90 to-black/90 backdrop-blur-lg border border-zinc-800/50 rounded-xs p-8 md:p-16 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-xs translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-xs -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,50 Q250,150 500,50 T1000,50"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
            
            <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
              <div className="md:w-3/5">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                >
                  Pronto para revolucionar seu <br/>
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">DELIVERY?</span>
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xl text-zinc-400 mb-8"
                >
                  Junte-se a centenas de empresas que já transformaram seus negócios 
                  com o Versa Delivery. Comece hoje mesmo com nosso período de teste gratuito.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="md:w-2/5 flex flex-col gap-4"
              >
                <Link href="/login">
                  <Button className="w-full font-antarctican-mono bg-primary border-white text-white hover:bg-white hover:text-black text-lg font-semibold py-7 rounded-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group">
                    <span>COMECE SEU TESTE GRATUITO</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;