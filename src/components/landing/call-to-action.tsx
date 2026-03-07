"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#c0fea4]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] px-8 py-16 md:px-16 md:py-20 text-center"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight leading-tight mb-5">
              Pronto pra crescer com o Versa?
            </h2>
            <p className="text-lg text-black/75 mb-10 max-w-lg mx-auto leading-relaxed">
              Conecte-se com seus clientes, gerencie entregas e venda mais. Tudo
              numa plataforma só.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <button className="bg-[#1B1B1B] flex flex-row items-center justify-center gap-2 hover:bg-black text-white text-base font-medium px-14 py-5 rounded-2xl transition-colors cursor-pointer">
                  Comece agora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
