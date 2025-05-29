"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import bannerImg from "@/public/img/banner_image.jpg"
import logoHero from "@/public/img/logo_hero.svg"

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      id="home" 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={bannerImg}
          alt="Background"
          className="w-full h-full object-cover brightness-[0.4] rounded-b-[50px] md:rounded-b-[120px]"
          priority
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black z-10"></div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-0 md:mt-12 text-start font-antarctican-mono font-semibold text-emerald-400 text-lg md:text-xl w-full md:w-2/6"
          >
            FLEXÍVEL COMO<br />
            SEU NEGÓCIO PEDE
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.4,
              type: "spring", 
              stiffness: 100 
            }}
            className="my-8 relative"
          >
            {/* <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-xl animate-pulse"></div> */}
            <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
            <Image 
              src={logoHero} 
              alt="Versa Delivery" 
              className="w-[70vw] md:w-[40vw] relative drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              width={500}
              height={200}
            />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-0 md:mt-12 text-end font-antarctican-mono font-semibold text-emerald-400 text-lg md:text-xl w-full md:w-2/6"
          >
            TUDO NO SEU CONTROLE
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.8,
            type: "spring",
            stiffness: 50
          }}
          className="mt-12"
        >
          <Link href="/login">
            <Button className="relative overflow-hidden group rounded-none cursor-pointer bg-transparent font-mono border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 transition-all duration-300">
              <span className="absolute inset-0 w-full h-full bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">ASSINE AGORA</span>
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center mt-12">
            <span className="text-white/60 text-sm mb-2 mt-24">Descubra mais</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
              <motion.div
                animate={{ 
                  y: [0, 12, 0],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "loop" 
                }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;