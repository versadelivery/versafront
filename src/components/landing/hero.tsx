"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const rotatingWords = ["pedido", "entrega", "venda", "cliente"];

const Hero = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="relative pt-36 pb-24 md:pt-48 md:pb-36 rounded-b-[2.5rem] md:rounded-b-[4rem] overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-tomato text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-[#1B1B1B] leading-[1.12] tracking-tight mb-6"
            >
              Transforme cada{" "}
              <span className="relative inline-block min-w-[160px] sm:min-w-[220px] text-left text-[#009246]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingWords[wordIndex]}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block"
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />
              em um cliente para sempre
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#463b3f] max-w-2xl mb-10 leading-relaxed lg:mx-0 mx-auto"
            >
              Seu delivery online completo. Catálogo flexível, pedidos em tempo
              real e seu cliente escolhendo como quer comprar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 lg:justify-start justify-center"
            >
              <Link href="/register">
                <button className="bg-[#1B1B1B] hover:bg-[#7ED957] text-white hover:text-black text-xl font-semibold px-16 py-6 rounded-2xl transition-colors cursor-pointer">
                  Comece agora
                </button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 text-base text-[#463b3f] lg:text-left text-center"
            >
              Rápido e fácil, como seu negócio pede!
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
