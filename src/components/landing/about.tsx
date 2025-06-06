"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import meat from "../../../public/img/meat_img.png"

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section 
      id="sobre" 
      ref={ref}
      className="relative bg-white text-black py-20 overflow-hidden font-antarctican-mono"
    >
      <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <motion.div variants={itemVariants} className="inline-block">
              <div className="flex flex-col items-start">
                <p className="bg-transparent font-bold text-xl md:text-3xl">O QUE É O</p>
                <h2 className="bg-primary font-black text-2xl md:text-5xl text-white px-2 py-1">
                  VERSA DELIVERY?
                </h2>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="inline-block">
              <div className="font-mono flex flex-col items-start mt-8">
                <p className="bg-transparent text-black font-bold text-lg md:text-3xl">A PLATAFORMA QUE SE ADAPTA AO</p>
                <h3 className="text-lg md:text-3xl font-bold bg-black text-white inline-block px-2 py-1">
                  SEU JEITO DE VENDER.
                </h3>
              </div>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="font-regular mt-8 text-lg"
            >
              O <span className="font-bold">VERSA DELIVERY</span> É A PLATAFORMA FLEXÍVEL
              QUE PERMITE AO SEU CLIENTE ESCOLHER EXATAMENTE
              COMO QUER RECEBER O PEDIDO — <span className="font-bold">DESDE O PESO IDEAL
              DO PRODUTO ATÉ A FORMA DE ENTREGA.</span>
            </motion.p>

            <motion.div variants={itemVariants}>
              <p className="mt-12 font-bold text-lg">
                SIMPLES, DIRETO E COM TOTAL CONTROLE NAS SUAS MÃOS.
              </p>
              <p className="text-lg">
                VOCÊ VENDE COMO QUISER, E SEU CLIENTE COMPRA COMO PRECISA.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-8"
            >
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/80 text-white rounded-xs text-lg px-8 py-6 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/40 font-antarctican-mono">
                  COMEÇAR AGORA
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="relative flex justify-center md:justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/20 rounded-2xl transform rotate-3 scale-105"></div>
            <Image
              src={meat}
              alt="Meat cuts"
              className="rounded-2xl w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] shadow-xl relative z-10 transform hover:scale-105 transition-transform duration-500"
              width={500}
              height={300}
            />
            
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              className="absolute top-10 left-10 w-16 h-16 bg-black/80 text-white rounded-full flex items-center justify-center font-bold z-20 shadow-lg"
            >
              100%
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5
              }}
              className="absolute bottom-10 right-10 w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center font-bold z-20 shadow-lg"
            >
              Flexível
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;